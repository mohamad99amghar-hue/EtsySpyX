
import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/db';
import { encrypt } from '../utils/crypto';
import { CONFIG } from '../config';
import crypto from 'crypto';
import axios from 'axios';

// Utils for PKCE
function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function sha256(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export async function etsyRoutes(app: FastifyInstance) {
  // Start OAuth Flow
  app.get('/oauth/start', { onRequest: [app.authenticate] }, async (req, reply) => {
    const integration = await prisma.integration.findUnique({ where: { userId: req.user.id } });
    
    if (!integration?.etsyClientId) {
      return reply.code(400).send({ error: 'Etsy Client ID missing in Integrations' });
    }

    // PKCE Generation
    const verifier = base64URLEncode(crypto.randomBytes(32));
    const challenge = base64URLEncode(sha256(Buffer.from(verifier)));
    const state = crypto.randomBytes(16).toString('hex');

    // Store state/verifier map temporarily
    // In production, use Redis with TTL. Here we use a DB table with clean up.
    await prisma.oAuthState.create({
      data: { state, verifier }
    });

    const scopes = encodeURIComponent('listings_r listings_w shops_r');
    const redirectUrl = encodeURIComponent(CONFIG.ETSY_REDIRECT_URI);
    const clientId = integration.etsyClientId;

    const url = `https://www.etsy.com/oauth/connect?response_type=code&redirect_uri=${redirectUrl}&scope=${scopes}&client_id=${clientId}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;

    // We also need to know WHO the user is when callback hits. 
    // Usually we use a cookie for state, but since we are API-first, we'll append userId to state or trust the client to handle session? 
    // Standard approach: OAuth callback hits backend. Backend needs session cookie.
    // Our auth middleware handles session. We just need to link 'state' to 'verifier'.
    // NOTE: The callback comes from Browser redirect. Browser has the JWT cookie (if we used cookies) or no headers (if we use Bearer).
    // If using Bearer, we can't easily persist session on redirect.
    // SOLUTION: Use a short-lived cookie for the 'state' that maps to the DB entry. Or include userId in state?
    // Let's assume the user is logged in via Cookie for simplicity or we attach a query param token (insecure).
    // Better: Return the URL to frontend. Frontend redirects. Frontend handles auth.
    
    return { url }; 
  });

  // OAuth Callback
  app.get('/oauth/callback', async (req, reply) => {
    const { code, state, error } = req.query as any;

    if (error) return reply.send(`Error: ${error}`);
    if (!code || !state) return reply.send('Missing code or state');

    // Verify State
    const storedState = await prisma.oAuthState.findUnique({ where: { state } });
    if (!storedState) return reply.send('Invalid state or timeout');

    // Delete used state
    await prisma.oAuthState.delete({ where: { state } });

    // We don't have the user ID here if it's a browser redirect without auth headers.
    // To solve this in a proper SPA:
    // 1. Frontend catches the callback route /app/integrations/callback
    // 2. Frontend calls API POST /api/etsy/oauth/finish { code, state } with Bearer token.
    // Let's implement THAT instead of handling logic in GET.
    
    return reply.redirect(`${CONFIG.FRONTEND_URL}/app/integrations?code=${code}&state=${state}`);
  });

  // Finish OAuth (Authenticated)
  app.post('/oauth/finish', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { code, state } = req.body as any;
    
    const storedState = await prisma.oAuthState.findUnique({ where: { state } });
    if (!storedState) return reply.code(400).send({ error: 'Invalid state' });
    
    await prisma.oAuthState.delete({ where: { state } });

    const integration = await prisma.integration.findUnique({ where: { userId: req.user.id } });
    if (!integration || !integration.etsyClientId) return reply.code(400).send({ error: 'Config missing' });

    // Exchange Token
    try {
        const response = await axios.post('https://api.etsy.com/v3/public/oauth/token', {
            grant_type: 'authorization_code',
            client_id: integration.etsyClientId,
            redirect_uri: CONFIG.ETSY_REDIRECT_URI,
            code: code,
            code_verifier: storedState.verifier
        });

        const { access_token, refresh_token, expires_in, x_etsy_user_id } = response.data;
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Fetch Shop ID
        // const shopRes = await axios.get(`https://api.etsy.com/v3/application/users/${x_etsy_user_id}/shops`, {
        //     headers: { 'x-api-key': integration.etsyClientId, 'Authorization': `Bearer ${access_token}` }
        // });
        // const shopId = shopRes.data.shop_id.toString();

        await prisma.etsyAccount.upsert({
            where: { userId: req.user.id },
            create: {
                userId: req.user.id,
                etsyUserId: x_etsy_user_id.toString(),
                etsyShopId: 'pending', // Simplify for now
                accessTokenEnc: encrypt(access_token),
                refreshTokenEnc: encrypt(refresh_token),
                expiresAt,
                connectedAt: new Date()
            },
            update: {
                accessTokenEnc: encrypt(access_token),
                refreshTokenEnc: encrypt(refresh_token),
                expiresAt
            }
        });

        return { success: true };

    } catch (e: any) {
        console.error('Etsy Token Exchange Error', e.response?.data || e.message);
        return reply.code(500).send({ error: 'Failed to connect Etsy' });
    }
  });

  app.post('/disconnect', { onRequest: [app.authenticate] }, async (req, reply) => {
      await prisma.etsyAccount.delete({ where: { userId: req.user.id } });
      return { success: true };
  });
}

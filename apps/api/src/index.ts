
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { CONFIG } from './config';
import { authRoutes } from './routes/auth';
import { integrationRoutes } from './routes/integrations';
import { etsyRoutes } from './routes/etsy';
import { aiRoutes } from './routes/ai';

const app = fastify({ logger: true });

// Plugins
app.register(cors, { 
  origin: CONFIG.FRONTEND_URL,
  credentials: true 
});

app.register(jwt, {
  secret: CONFIG.JWT_SECRET
});

app.decorate('authenticate', async (req: any, reply: any) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Routes
app.get('/health', async () => ({ status: 'ok' }));
app.register(authRoutes, { prefix: '/api/auth' });
app.register(integrationRoutes, { prefix: '/api/integrations' });
app.register(etsyRoutes, { prefix: '/api/etsy' });
app.register(aiRoutes, { prefix: '/api/ai' });

const start = async () => {
  try {
    await app.listen({ port: Number(CONFIG.PORT), host: '0.0.0.0' });
    console.log(`API running on port ${CONFIG.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

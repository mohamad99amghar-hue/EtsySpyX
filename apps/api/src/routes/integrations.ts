
import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/db';
import { encrypt, decrypt } from '../utils/crypto';
import { IntegrationSchema } from '@etsyspypro/shared-types';

export async function integrationRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/me', async (req) => {
    const integration = await prisma.integration.findUnique({ where: { userId: req.user.id } });
    const etsy = await prisma.etsyAccount.findUnique({ where: { userId: req.user.id } });
    
    return {
      aiProvider: integration?.aiProvider || 'openai',
      hasAiKey: !!integration?.aiApiKeyEnc,
      etsyClientId: integration?.etsyClientId || '',
      etsyConnected: !!etsy,
      etsyShopId: etsy?.etsyShopId,
    };
  });

  app.post('/save', async (req, reply) => {
    const body = IntegrationSchema.parse(req.body);
    
    const data: any = {
      aiProvider: body.aiProvider,
      etsyClientId: body.etsyClientId,
    };

    if (body.apiKey) {
      data.aiApiKeyEnc = encrypt(body.apiKey);
    }
    if (body.etsyClientSecret) {
      data.etsyClientSecretEnc = encrypt(body.etsyClientSecret);
    }

    await prisma.integration.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data }
    });

    return { success: true };
  });
}


import { FastifyInstance } from 'fastify';
import { AiService } from '../services/ai';

export async function aiRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.post('/run', async (req, reply) => {
    const { type, input } = req.body as { type: any, input: any };
    
    if (!['keyword', 'listing_optimize', 'shop_spy'].includes(type)) {
      return reply.code(400).send({ error: 'Invalid analysis type' });
    }

    const ai = new AiService(req.user.id);
    const result = await ai.runAnalysis(type, input);
    
    return result;
  });
}

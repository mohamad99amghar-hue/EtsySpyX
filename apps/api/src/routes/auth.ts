
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db';
import { AuthSchema } from '@etsyspypro/shared-types';
import { z } from 'zod';

export async function authRoutes(app: FastifyInstance) {
  
  app.post('/signup', async (req, reply) => {
    const body = AuthSchema.parse(req.body);
    
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return reply.code(400).send({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(body.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name || 'User',
      }
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });
    
    // Create empty integration record
    await prisma.integration.create({ data: { userId: user.id }});

    return { token, user: { id: user.id, email: user.email, name: user.name } };
  });

  app.post('/login', async (req, reply) => {
    const body = z.object({ email: z.string(), password: z.string() }).parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return reply.code(401).send({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });

    const token = app.jwt.sign({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  });

  app.get('/me', { onRequest: [app.authenticate] }, async (req, reply) => {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, plan: true }
    });
    return user;
  });

  app.post('/logout', async (req, reply) => {
    // In a stateless JWT setup, client just discards token.
    // Real implementation should maintain a deny-list in Redis.
    return { success: true };
  });
}

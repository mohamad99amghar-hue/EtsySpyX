
import { z } from 'zod';

export const UserRole = z.enum(['FREE', 'PRO', 'ELITE']);
export type UserRole = z.infer<typeof UserRole>;

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

export const IntegrationSchema = z.object({
  aiProvider: z.enum(['openai', 'claude']),
  apiKey: z.string().optional(), // sent as blank if not changing
  etsyClientId: z.string().optional(),
  etsyClientSecret: z.string().optional(),
});

export interface AiRunResponse {
  runId: string;
  type: string;
  data: any;
  summary: string;
  actions: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: UserRole;
}

export interface EtsyConnectionStatus {
  connected: boolean;
  shopId?: string;
  userId?: string;
}

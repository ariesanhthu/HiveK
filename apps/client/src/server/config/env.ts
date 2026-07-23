import { z } from 'zod';

const serverEnvSchema = z.object({
  appEnv: z.string().default('development'),
  appUrl: z.string().default('http://localhost:3000'),
  hivekBackendBaseUrl: z
    .string()
    .url()
    .default('https://hivek-main-backend-54ef5f252bc1.herokuapp.com'),
  hivekBackendApiKey: z.string().optional(),
  redisUrl: z.string().optional(),
  aiCacheTtlSeconds: z.coerce.number().int().positive().default(300),
  aiAgentProvider: z.string().default('mock'),
  aiLogAgentTrace: z.coerce.boolean().default(false),
});

export const serverEnv = serverEnvSchema.parse({
  appEnv: process.env.APP_ENV,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  hivekBackendBaseUrl: process.env.HIVEK_BACKEND_BASE_URL,
  hivekBackendApiKey: process.env.HIVEK_BACKEND_API_KEY,
  redisUrl: process.env.REDIS_URL,
  aiCacheTtlSeconds: process.env.AI_CACHE_TTL_SECONDS,
  aiAgentProvider: process.env.AI_AGENT_PROVIDER,
  aiLogAgentTrace: process.env.AI_LOG_AGENT_TRACE,
});

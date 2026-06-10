import { z } from "zod";

const serverEnvSchema = z.object({
  appEnv: z.string().default("development"),
  appUrl: z.string().default("http://localhost:3000"),
  redisUrl: z.string().optional(),
  aiCacheTtlSeconds: z.coerce.number().int().positive().default(300),
  aiAgentProvider: z.string().default("mock"),
  aiLogAgentTrace: z.coerce.boolean().default(false),
});

export const serverEnv = serverEnvSchema.parse({
  appEnv: process.env.APP_ENV,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  redisUrl: process.env.REDIS_URL,
  aiCacheTtlSeconds: process.env.AI_CACHE_TTL_SECONDS,
  aiAgentProvider: process.env.AI_AGENT_PROVIDER,
  aiLogAgentTrace: process.env.AI_LOG_AGENT_TRACE,
});

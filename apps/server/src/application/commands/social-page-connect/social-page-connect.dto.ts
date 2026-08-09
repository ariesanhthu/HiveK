import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SocialPageConnectInputSchema = z
  .object({
    platformId: z.string().min(1),
    platformCode: z.string().min(1),
    pageId: z.string().min(1),
    pageName: z.string().min(1),
    pictureUrl: z.string().nullable().optional(),
    followerCount: z.number().nullable().optional(),
    accessToken: z.string().min(1),
    tokenExpiresAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export class SocialPageConnectInputDto extends createZodDto(
  SocialPageConnectInputSchema,
) {}

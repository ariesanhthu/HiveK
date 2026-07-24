import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const KolPlatformInfoDtoSchema = z
  .object({
    platformId: z.string(),
    uniqueId: z.string(),
    externalId: z.string(),
    followerCount: z.number().int().nonnegative(),
    avgEngagement: z.number().nonnegative(),
    topTags: z.array(z.string()),
    categories: z.array(z.string()),
  })
  .strict();

export const KolProfileDtoSchema = z
  .object({
    id: z.string(),
    userId: z.string().nullable().optional(),
    verificationType: z.string().nullable().optional(),
    name: z.string(),
    location: z.string(),
    gender: z.string(),
    bio: z.string(),
    email: z.email(),
    phone: z.string(),
    platforms: z.array(KolPlatformInfoDtoSchema),
    isVerified: z.boolean(),
    scores: z.record(z.string(), z.any()).optional(),
  })
  .strict();

import { UserDto } from './user.dto';

export class KolProfileDto extends createZodDto(KolProfileDtoSchema) {}

export class KolProfileDetailDto extends KolProfileDto {
  user?: UserDto;
}

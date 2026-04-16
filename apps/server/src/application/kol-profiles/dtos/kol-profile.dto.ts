import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const KolPlatformInfoDtoSchema = z.object({
  platformId: z.string(),
  handle: z.string(),
  externalId: z.string(),
  followerCount: z.number().int().nonnegative(),
  avgEngagement: z.number().nonnegative(),
  topTags: z.array(z.string()),
  categories: z.array(z.string()),
});

export const KolProfileDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  gender: z.string(),
  bio: z.string(),
  email: z.string().email(),
  phone: z.string(),
  platforms: z.array(KolPlatformInfoDtoSchema),
  isVerified: z.boolean(),
});

export class KolProfileDto extends createZodDto(KolProfileDtoSchema) {}

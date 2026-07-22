import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SocialPageDtoSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  platformId: z.string(),
  platformCode: z.string(),
  pageId: z.string(),
  pageName: z.string(),
  pictureUrl: z.string().nullable(),
  followerCount: z.number().nullable(),
  webhookVerifyToken: z.string(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export class SocialPageDto extends createZodDto(SocialPageDtoSchema) {}


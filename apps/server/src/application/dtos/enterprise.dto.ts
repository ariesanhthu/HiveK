import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { UploadedFileDto, UploadedFileDtoSchema } from './uploaded-file.dto';
import { UserDto, UserDetailDtoSchema } from './user.dto';

export const EnterpriseDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyName: z.string(),
  description: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  website: z.string().nullable(),
  taxId: z.string().nullable(),
  logoUrlId: z.string().nullable(),
  isVerified: z.boolean(),
  members: z.array(z.object({ userId: z.string(), mode: z.string() })).default([]),
  knowledgeBase: z.object({
    rawText: z.string().optional(),
    externalLinks: z.array(z.string()),
    updatedAt: z.iso.datetime(),
  }).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export class EnterpriseDto extends createZodDto(EnterpriseDtoSchema) {}

export const EnterpriseDetailDtoSchema = EnterpriseDtoSchema.extend({
  logoUrlId: UploadedFileDtoSchema.nullable(),
  user: UserDetailDtoSchema.optional(),
});

export class EnterpriseDetailDto extends createZodDto(EnterpriseDetailDtoSchema) {}


import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ETargetType } from '@/core/enums/target-type.enum';

export const UploadedFileDtoSchema = z.object({
  id: z.string(),
  url: z.url(),
  publicId: z.string(),
  size: z.number().int().positive(),
  format: z.string(),
  title: z.string().nullable(),
  targetType: z.enum(ETargetType),
  targetId: z.string(),
  targetField: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).strict();

export class UploadedFileDto extends createZodDto(UploadedFileDtoSchema) { }

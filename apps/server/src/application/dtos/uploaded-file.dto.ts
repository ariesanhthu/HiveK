import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { TargetType } from '@/core/enums/target-type.enum';

export const UploadedFileDtoSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  publicId: z.string(),
  size: z.number().int().positive(),
  format: z.string(),
  title: z.string().nullable(),
  targetType: z.nativeEnum(TargetType),
  targetId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class UploadedFileDto extends createZodDto(UploadedFileDtoSchema) {}

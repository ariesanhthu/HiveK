import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ETargetType } from '@/core/enums/target-type.enum';
import { EUploadTargetField } from '@/core/enums';

export const UploadedFileCreateInputSchema = z.object({
  title: z.string().optional(),
  targetType: z.enum(ETargetType),
  targetId: z.string(),
  targetField: z.enum(EUploadTargetField),
}).strict();

export class UploadedFileCreateInputDto extends createZodDto(UploadedFileCreateInputSchema) { }


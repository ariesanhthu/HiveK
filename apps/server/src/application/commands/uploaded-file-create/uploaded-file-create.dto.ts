import { TargetType } from '@/core/enums/target-type.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UploadedFileCreateInputSchema = z
  .object({
    title: z.string().optional(),
    targetType: z.enum(TargetType),
    targetId: z.string(),
    targetField: z.string(),
  })
  .strict();

export class UploadedFileCreateInputDto extends createZodDto(
  UploadedFileCreateInputSchema,
) {}

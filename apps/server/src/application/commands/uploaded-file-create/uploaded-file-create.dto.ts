import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { TargetType } from '@/core/enums/target-type.enum';

export const UploadedFileCreateInputSchema = z.object({
  title: z.string().optional(),
  targetType: z.enum(TargetType),
  targetId: z.string(),
});

export class UploadedFileCreateInputDto extends createZodDto(UploadedFileCreateInputSchema) {}

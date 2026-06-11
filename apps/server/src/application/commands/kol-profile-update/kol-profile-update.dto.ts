import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateKolProfileDtoSchema = z.object({
  gender: z.string().optional(),
  scores: z.record(z.string(), z.any()).optional(),
  bio: z.string().optional(),
}).strict();

export class UpdateKolProfileDto extends createZodDto(UpdateKolProfileDtoSchema) {}

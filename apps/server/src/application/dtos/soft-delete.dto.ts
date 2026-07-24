import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SoftDeleteInputSchema = z
  .object({
    deletedBy: z
      .string()
      .default('system')
      .describe('The user performing the soft delete action'),
  })
  .strict();

export class SoftDeleteInputDto extends createZodDto(SoftDeleteInputSchema) {}

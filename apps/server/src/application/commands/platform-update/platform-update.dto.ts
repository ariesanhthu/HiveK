import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PlatformCreateInputSchema } from '../platform-create/platform-create.dto';

export const PlatformUpdateInputSchema = PlatformCreateInputSchema.partial();

export class PlatformUpdateInputDto extends createZodDto(
  PlatformUpdateInputSchema,
) {}

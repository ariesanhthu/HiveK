import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UserCheckValidInputSchema = z.object({
  id: z.string().min(1),
}).strict();

export class UserCheckValidInputDto extends createZodDto(UserCheckValidInputSchema) {}

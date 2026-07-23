import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ProposalUpdateMetricsInputSchema = z.object({
  key: z.string().min(1),
  value: z.number().int().nonnegative().default(1),
}).strict();

export class ProposalUpdateMetricsInputDto extends createZodDto(ProposalUpdateMetricsInputSchema) {}

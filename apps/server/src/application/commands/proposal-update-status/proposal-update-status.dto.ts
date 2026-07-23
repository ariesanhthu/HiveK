import { EProposalStatus } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ProposalUpdateStatusInputSchema = z.object({
  status: z.enum(EProposalStatus),
}).strict();

export class ProposalUpdateStatusInputDto extends createZodDto(ProposalUpdateStatusInputSchema) {}

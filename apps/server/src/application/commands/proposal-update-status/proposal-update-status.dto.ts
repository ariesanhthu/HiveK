import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EProposalStatus } from '@/core/enums';

export const ProposalUpdateStatusInputSchema = z
  .object({
    status: z.enum(EProposalStatus),
  })
  .strict();

export class ProposalUpdateStatusInputDto extends createZodDto(
  ProposalUpdateStatusInputSchema,
) {}

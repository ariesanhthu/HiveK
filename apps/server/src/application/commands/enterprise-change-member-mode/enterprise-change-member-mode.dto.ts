import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EEnterpriseMemberMode } from '@/core/enums';

export const EnterpriseChangeMemberModeInputSchema = z
  .object({
    userId: z.string().min(1),
    mode: z.enum(EEnterpriseMemberMode),
  })
  .strict();

export class EnterpriseChangeMemberModeInputDto extends createZodDto(
  EnterpriseChangeMemberModeInputSchema,
) {}

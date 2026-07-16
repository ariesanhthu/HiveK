import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EEnterpriseMemberMode } from '@/core/enums';

export const EnterpriseInviteMemberInputSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  mode: z.nativeEnum(EEnterpriseMemberMode),
}).strict();

export class EnterpriseInviteMemberInputDto extends createZodDto(EnterpriseInviteMemberInputSchema) {}

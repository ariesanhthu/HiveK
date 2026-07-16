import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EEnterpriseMemberMode, EEnterpriseInvitationStatus } from '@/core/enums';

export const EnterpriseInvitationDtoSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  email: z.string().email(),
  mode: z.nativeEnum(EEnterpriseMemberMode),
  inviterId: z.string(),
  status: z.nativeEnum(EEnterpriseInvitationStatus),
  expiresAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).strict();

export class EnterpriseInvitationDto extends createZodDto(EnterpriseInvitationDtoSchema) {}

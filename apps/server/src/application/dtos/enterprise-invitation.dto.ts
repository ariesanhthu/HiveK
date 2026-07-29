import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  EEnterpriseMemberMode,
  EEnterpriseInvitationStatus,
} from '@/core/enums';

export const EnterpriseInvitationDtoSchema = z
  .object({
    id: z.string(),
    enterpriseId: z.string(),
    email: z.email(),
    mode: z.enum(EEnterpriseMemberMode),
    inviterId: z.string(),
    status: z.enum(EEnterpriseInvitationStatus),
    expiresAt: z.iso.datetime(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export class EnterpriseInvitationDto extends createZodDto(
  EnterpriseInvitationDtoSchema,
) {}

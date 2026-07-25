import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';

export const EnterpriseInvitationFilterSchema = CursorPaginationRequestSchema.extend({
  isExpired: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  email: z.email().optional(),
}).strict();

export class EnterpriseInvitationFilterDto extends createZodDto(EnterpriseInvitationFilterSchema) { }
export class EnterpriseGetMyInvitationsInputDto extends EnterpriseInvitationFilterDto { }

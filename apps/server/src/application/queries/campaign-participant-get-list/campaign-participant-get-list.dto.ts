import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { EParticipantStatus } from '@/core/enums';

export const CampaignParticipantFilterSchema = CursorPaginationRequestSchema.extend({
  campaignId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional(),
  kolProfileId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional(),
  status: z.enum(EParticipantStatus).optional(),
});

export class CampaignParticipantFilterDto extends createZodDto(CampaignParticipantFilterSchema) {}

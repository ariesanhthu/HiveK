import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';

export const CampaignFilterSchema = CursorPaginationRequestSchema.extend({
  name: z.string().optional(),
  ownerId: z.string().optional(),
  enterpriseId: z.string().optional(),
});

export class CampaignFilterDto extends createZodDto(CampaignFilterSchema) {}

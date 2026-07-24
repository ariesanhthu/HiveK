import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CampaignFilterSchema = CursorPaginationRequestSchema.extend({
  name: z.string().optional(),
  ownerId: z.string().optional(),
  enterpriseId: z.string().optional(),
});

export class CampaignFilterDto extends createZodDto(CampaignFilterSchema) {}

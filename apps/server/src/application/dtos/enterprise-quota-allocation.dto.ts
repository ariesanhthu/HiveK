import { CursorPaginationRequestSchema } from './pagination.dto';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EGrantType } from '@/core/enums';

export const QuotaAllocationItemSchema = z.object({
  enterpriseId: z.string(),
  key: z.string(),
  allocated: z.number(),
  kind: z.enum(EGrantType),
  isPool: z.boolean(),
}).strict();

export class QuotaAllocationItemDto extends createZodDto(QuotaAllocationItemSchema) { }
export type QuotaAllocationItemDTO = QuotaAllocationItemDto;

export const EnterpriseQuotaAllocationResponseDtoSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  allocations: z.array(QuotaAllocationItemSchema),
  updatedAt: z.iso.datetime(),
}).strict();

export class EnterpriseQuotaAllocationResponseDto extends createZodDto(EnterpriseQuotaAllocationResponseDtoSchema) { }

export const EnterpriseQuotaAllocationFilterDtoSchema = CursorPaginationRequestSchema.extend({
  ownerId: z.string().optional(),
});

export class EnterpriseQuotaAllocationFilterDto extends createZodDto(EnterpriseQuotaAllocationFilterDtoSchema) { }


import { SortOrder } from './pagination.dto';
import { z } from 'zod';
import { EGrantType } from '@/core/enums';

const QuotaAllocationItemSchema = z.object({
  enterpriseId: z.string(),
  key: z.string(),
  allocated: z.number(),
  kind: z.nativeEnum(EGrantType),
  isPool: z.boolean(),
});

export type QuotaAllocationItemDTO = z.infer<typeof QuotaAllocationItemSchema>;

export class EnterpriseQuotaAllocationResponseDto {
  id: string;
  ownerId: string;
  allocations: QuotaAllocationItemDTO[];
  updatedAt: Date;
}

export class EnterpriseQuotaAllocationFilterDto {
  ownerId?: string;
  cursor?: string;
  limit?: number;
  sort?: SortOrder;
}

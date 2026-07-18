import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { EnterpriseQuotaAllocationGetByOwnerIdQuery } from './enterprise-quota-allocation-get-by-owner-id.query';
import type { IEnterpriseQuotaAllocationReadService } from "@/application/interfaces/read-service";
import { ENTERPRISE_QUOTA_ALLOCATION_READ_SERVICE } from '@/application/interfaces/read-service';
import { EnterpriseQuotaAllocationResponseDto } from '@/application/dtos';

@QueryHandler(EnterpriseQuotaAllocationGetByOwnerIdQuery)
export class EnterpriseQuotaAllocationGetByOwnerIdHandler implements IQueryHandler<EnterpriseQuotaAllocationGetByOwnerIdQuery> {
  constructor(
    @Inject(ENTERPRISE_QUOTA_ALLOCATION_READ_SERVICE)
    private readonly readService: IEnterpriseQuotaAllocationReadService,
  ) {}

  async execute(query: EnterpriseQuotaAllocationGetByOwnerIdQuery): Promise<EnterpriseQuotaAllocationResponseDto> {
    const dto = await this.readService.findByOwnerId(query.ownerId);
    if (!dto) {
      throw new NotFoundException(`Enterprise quota allocation for owner ID ${query.ownerId} not found`);
    }
    return dto;
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { QuotaUsageGetByEnterpriseIdQuery } from './quota-usage-get-by-enterprise-id.query';
import type { IQuotaUsageReadService } from "@/application/interfaces/read-service";
import { QUOTA_USAGE_READ_SERVICE } from '@/application/interfaces/read-service';
import { QuotaUsageResponseDto } from '@/application/dtos';

@QueryHandler(QuotaUsageGetByEnterpriseIdQuery)
export class QuotaUsageGetByEnterpriseIdHandler implements IQueryHandler<QuotaUsageGetByEnterpriseIdQuery> {
  constructor(
    @Inject(QUOTA_USAGE_READ_SERVICE)
    private readonly readService: IQuotaUsageReadService,
  ) {}

  async execute(query: QuotaUsageGetByEnterpriseIdQuery): Promise<QuotaUsageResponseDto> {
    const dto = await this.readService.findByEnterpriseId(query.enterpriseId);
    if (!dto) {
      throw new NotFoundException(`Quota usage for enterprise ID ${query.enterpriseId} not found`);
    }
    return dto;
  }
}

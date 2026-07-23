import { EnterpriseDetailDto } from '@/application/dtos';
import { ENTERPRISE_READ_SERVICE, type IEnterpriseReadService } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EnterpriseGetByIdQuery } from './enterprise-get-by-id.query';

import { EnterpriseNotFoundException } from '@/core/exceptions';

@QueryHandler(EnterpriseGetByIdQuery)
export class EnterpriseGetByIdHandler
  implements IQueryHandler<EnterpriseGetByIdQuery, EnterpriseDetailDto>
{
  constructor(
    @Inject(ENTERPRISE_READ_SERVICE) private readonly readService: IEnterpriseReadService,
  ) {}

  async execute(query: EnterpriseGetByIdQuery): Promise<EnterpriseDetailDto> {
    const result = await this.readService.findById(query.id);
    if (!result) {
      throw new EnterpriseNotFoundException(query.id);
    }
    return result;
  }
}

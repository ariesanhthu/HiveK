import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENTERPRISE_READ_SERVICE, type IEnterpriseReadService } from '@/application/interfaces';
import { EnterpriseDto } from '@/application/dtos';
import { EnterpriseGetByIdQuery } from './enterprise-get-by-id.query';

@QueryHandler(EnterpriseGetByIdQuery)
export class EnterpriseGetByIdHandler implements IQueryHandler<EnterpriseGetByIdQuery> {
  constructor(
    @Inject(ENTERPRISE_READ_SERVICE)
    private readonly readService: IEnterpriseReadService,
  ) {}

  async execute(query: EnterpriseGetByIdQuery): Promise<EnterpriseDto> {
    const result = await this.readService.findById(query.id);
    if (!result) {
      throw new Error('Enterprise not found');
    }
    return result;
  }
}

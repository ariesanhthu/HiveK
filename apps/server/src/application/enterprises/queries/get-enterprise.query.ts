import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENTERPRISE_READ_SERVICE, type IEnterpriseReadService } from '@/application/interfaces';
import { EnterpriseDto } from '../dtos';

export class GetEnterpriseQuery extends Query<EnterpriseDto> {
	constructor(public readonly id: string) {
		super();
	}
}



@QueryHandler(GetEnterpriseQuery)
export class GetEnterpriseQueryHandler implements IQueryHandler<GetEnterpriseQuery> {
  constructor(
    @Inject(ENTERPRISE_READ_SERVICE)
    private readonly readService: IEnterpriseReadService,
  ) {}

  async execute(query: GetEnterpriseQuery): Promise<EnterpriseDto> {
    const result = await this.readService.findById(query.id);
    if (!result) {
      throw new Error('Enterprise not found');
    }
    return result;
  }
}


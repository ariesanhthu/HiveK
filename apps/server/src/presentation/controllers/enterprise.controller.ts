import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetEnterpriseQuery } from '@/application/enterprises/queries';
import { EnterpriseDto } from '@/application/enterprises/dtos';

@Controller('enterprises')
export class EnterpriseController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<EnterpriseDto> {
    const enterprise = await this.queryBus.execute<GetEnterpriseQuery, EnterpriseDto>(
      new GetEnterpriseQuery(id),
    );
    return enterprise;
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { EnterpriseGetByIdQuery } from '@/application/queries';
import { EnterpriseDto } from '@/application/dtos';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('enterprises')
@Controller('enterprises')
export class EnterpriseController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<EnterpriseDto> {
    const enterprise = await this.queryBus.execute<EnterpriseGetByIdQuery, EnterpriseDto>(
      new EnterpriseGetByIdQuery(id),
    );
    return enterprise;
  }
}

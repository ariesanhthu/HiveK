import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';

@ApiTags('CLIENT-roles')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller(buildVersionedRoute('client', 'roles', 1))
export class RoleClientController {
  constructor() {}
}

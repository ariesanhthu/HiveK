import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';

@ApiTags('CLIENT-roles')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller(buildVersionedRoute('client', 'roles', 1))
export class RoleClientController {
  constructor(
  ) {}
}

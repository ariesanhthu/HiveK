import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';

@ApiTags('CLIENT-roles')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller('client/roles')
export class RoleClientController {
  constructor(
  ) {}
}

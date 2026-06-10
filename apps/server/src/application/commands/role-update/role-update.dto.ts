import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RoleCreateInputSchema } from '../role-create/role-create.dto';

export const RoleUpdateInputSchema = RoleCreateInputSchema.partial();

export class RoleUpdateInputDto extends createZodDto(RoleUpdateInputSchema) {}

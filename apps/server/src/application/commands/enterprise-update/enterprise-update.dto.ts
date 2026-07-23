import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EnterpriseCreateInputSchema } from '../enterprise-create/enterprise-create.dto';

export const EnterpriseUpdateInputSchema = EnterpriseCreateInputSchema.partial();

export class EnterpriseUpdateInputDto extends createZodDto(EnterpriseUpdateInputSchema) {}

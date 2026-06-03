import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';
import { UserDto } from './user.dto';
import { UploadedFileDto } from './uploaded-file.dto';

export const EnterpriseDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyName: z.string(),
  description: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  website: z.string().nullable(),
  taxId: z.string().nullable(),
  logoUrlId: z.string().nullable(),
  isVerified: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export class EnterpriseDto extends createZodDto(EnterpriseDtoSchema) {}

export type EnterpriseDetailDto = Omit<EnterpriseDto, 'logoUrlId'> & {
  logoUrlId: UploadedFileDto | null;
  user?: UserDto;
};


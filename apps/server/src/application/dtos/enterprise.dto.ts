import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UploadedFileDto } from './uploaded-file.dto';
import { UserDto } from './user.dto';

export const EnterpriseDtoSchema = z
  .object({
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
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export class EnterpriseDto extends createZodDto(EnterpriseDtoSchema) {}

export type EnterpriseDetailDto = Omit<EnterpriseDto, 'logoUrlId'> & {
  logoUrlId: UploadedFileDto | null;
  user?: UserDto;
};

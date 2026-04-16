import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

export const PlatformDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.url(),
  apiStatus: z.enum(PlatformApiStatus),
  iconUrl: z.url(),
});

export class PlatformDto extends createZodDto(PlatformDtoSchema) {}

export const CreatePlatformInputDtoSchema = PlatformDtoSchema.omit({ id: true });
export class CreatePlatformInputDto extends createZodDto(CreatePlatformInputDtoSchema) {}

export const UpdatePlatformInputDtoSchema = PlatformDtoSchema.omit({ id: true }).partial();
export class UpdatePlatformInputDto extends createZodDto(UpdatePlatformInputDtoSchema) {}

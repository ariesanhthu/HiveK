import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SocialPageBulkConnectInputSchema = z
  .object({
    platformCode: z.string().min(1),
    longLivedUserToken: z.string().min(1),
  })
  .strict();

export class SocialPageBulkConnectInputDto extends createZodDto(
  SocialPageBulkConnectInputSchema,
) {}

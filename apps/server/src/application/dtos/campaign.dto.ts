import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

export const PlatformTargetItemDtoSchema = z.object({
  platformId: z.string(),
  minFollowers: z.number().optional(),
  maxFollowers: z.number().optional(),
  note: z.string().optional(),
  others: z.record(z.string(), z.any()).optional(),
});

export const RawContentItemDtoSchema = z.object({
  fileId: z.string(),
  rawContent: z.string().optional(),
});

export const CampaignDtoSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  enterpriseId: z.string().nullable(),
  budget: z.number().nonnegative(),
  financialTarget: z.record(z.string(), z.any()),
  description: z.string(),
  platformTarget: z.array(PlatformTargetItemDtoSchema),
  status: z.nativeEnum(ECampaignStatus),
  collaboratorIds: z.array(z.string()),
  rawContents: z.array(RawContentItemDtoSchema),
});

import { UserDto } from './user.dto';
import { EnterpriseDto } from './enterprise.dto';

export class CampaignDto extends createZodDto(CampaignDtoSchema) {}

export class CampaignDetailDto extends CampaignDto {
  owner?: UserDto;
  enterprise?: EnterpriseDto;
}

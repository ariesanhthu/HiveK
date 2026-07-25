import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EParticipantStatus, EOutputStatus, EOutputType } from '@/core/enums';

export const CampaignOutputDtoSchema = z.object({
  id: z.string(),
  platformId: z.string(),
  outputType: z.enum(EOutputType),
  title: z.string(),
  isScheduleForPost: z.boolean(),
  fileId: z.string().nullable(),
  scheduledAt: z.iso.datetime().nullable(),
  status: z.enum(EOutputStatus),
  url: z.string().nullable(),
  postedAt: z.iso.datetime().nullable(),
}).strict();

import { CampaignDetailDto } from './campaign.dto';
import { KolProfileDetailDto } from './kol-profile.dto';
import { PlatformDto } from './platform.dto';
import { UploadedFileDto } from './uploaded-file.dto';

export class CampaignOutputDto extends createZodDto(CampaignOutputDtoSchema) {
  platform?: PlatformDto;
  file?: UploadedFileDto;
}

export const CampaignParticipantDtoSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  kolProfileId: z.string(),
  status: z.enum(EParticipantStatus),
  joinedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  outputs: z.array(CampaignOutputDtoSchema),
}).strict();

export class CampaignParticipantDto extends createZodDto(CampaignParticipantDtoSchema) {
  campaign?: CampaignDetailDto;
  kolProfile?: KolProfileDetailDto;
}

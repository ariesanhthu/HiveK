import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GrantDtoSchema } from './package.dto';
import { CursorPaginationRequestSchema } from './pagination.dto';

export const SubscriptionChangeDetailsSchema = z
  .object({
    oldPlanId: z.string().nullable(),
    newPlanId: z.string().nullable(),
    addedAddonIds: z.array(z.string()),
    removedAddonIds: z.array(z.string()),
    oldGrants: z.array(GrantDtoSchema),
    newGrants: z.array(GrantDtoSchema),
    oldPermissions: z.array(z.string()),
    newPermissions: z.array(z.string()),
  })
  .strict();

export class SubscriptionChangeDetailsDto extends createZodDto(
  SubscriptionChangeDetailsSchema,
) {}
export type SubscriptionChangeDetailsDTO = SubscriptionChangeDetailsDto;

export const SubscriptionHistoryResponseDtoSchema = z
  .object({
    id: z.string(),
    subscriptionId: z.string(),
    userId: z.string(),
    billId: z.string().nullable(),
    actorId: z.string().nullable(),
    details: SubscriptionChangeDetailsSchema,
    createdAt: z.iso.datetime(),
  })
  .strict();

export class SubscriptionHistoryResponseDto extends createZodDto(
  SubscriptionHistoryResponseDtoSchema,
) {}

export const SubscriptionHistoryFilterDtoSchema =
  CursorPaginationRequestSchema.extend({
    subscriptionId: z.string().optional(),
    userId: z.string().optional(),
  });

export class SubscriptionHistoryFilterDto extends createZodDto(
  SubscriptionHistoryFilterDtoSchema,
) {}

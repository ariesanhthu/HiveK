import { z } from 'zod';
import { GrantDtoSchema, GrantDto } from './package.dto';

const SubscriptionChangeDetailsSchema = z.object({
  oldPlanId: z.string().nullable(),
  newPlanId: z.string().nullable(),
  addedAddonIds: z.array(z.string()),
  removedAddonIds: z.array(z.string()),
  oldGrants: z.array(GrantDtoSchema),
  newGrants: z.array(GrantDtoSchema),
  oldPermissions: z.array(z.string()),
  newPermissions: z.array(z.string()),
});

export type SubscriptionChangeDetailsDTO = z.infer<typeof SubscriptionChangeDetailsSchema>;

export class SubscriptionHistoryResponseDto {
  id: string;
  subscriptionId: string;
  userId: string;
  billId: string | null;
  actorId: string | null;
  details: SubscriptionChangeDetailsDTO;
  createdAt: Date;
}

import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EBillType, EBillStatus, EPurchaseType, EBillLineType } from '@/core/enums';

export const BillItemResponseSchema = z.object({
  lineType: z.enum(EBillLineType),
  packageId: z.string().nullable(),
  packageVariantId: z.string().nullable(),
  creditType: z.string().nullable(),
  creditAmount: z.number().nullable(),
  price: z.number(),
  taxPercent: z.number(),
  purchaseType: z.enum(EPurchaseType),
}).strict();

export class BillItemResponseDto extends createZodDto(BillItemResponseSchema) {}

export const BillResponseSchema = z.object({
  id: z.string(),
  billCode: z.string(),
  enterpriseId: z.string(),
  type: z.enum([EBillType.PURCHASE, EBillType.REFUND]),
  status: z.enum([EBillStatus.PENDING, EBillStatus.DONE, EBillStatus.CANCELLED]),
  items: z.array(BillItemResponseSchema),
  totalAmount: z.number(),
  taxAmount: z.number(),
  finalAmount: z.number(),
  currency: z.string(),
  expiresAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
}).strict();

export class BillResponseDto extends createZodDto(BillResponseSchema) {}

export const BillCalculateResponseSchema = z.object({
  items: z.array(BillItemResponseSchema),
  totalAmount: z.number(),
  taxAmount: z.number(),
  finalAmount: z.number(),
  currency: z.string(),
}).strict();

export class BillCalculateResponseDto extends createZodDto(BillCalculateResponseSchema) {}


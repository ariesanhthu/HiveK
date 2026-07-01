import { ESortOrder } from '../enums';
import z from 'zod';

export const PaginationCursorQuerySchema = z.object({
	cursor: z.preprocess((val) => {
		if (val === '') return null;
		return val;
	}, z.string().nullable().default(null)),

	limit: z.coerce.number().optional().default(10),

	sortOrder: z.preprocess((val) => {
		if (val === '') {
			return undefined;
		}
	}, z.enum(ESortOrder).optional().default(ESortOrder.DESC)),
});

export type PaginationCursorQueryDto = z.infer<typeof PaginationCursorQuerySchema>;

export const PaginationCursorQueryWithCompanySchema = PaginationCursorQuerySchema.extend({
	enterpriseId: z.string().optional(),
});

export type PaginationCursorQueryWithCompanyDto = z.infer<
	typeof PaginationCursorQueryWithCompanySchema
>;

export const PaginationCursorResponseSchema = z.object({
	items: z.array(z.unknown()),
	nextCursor: z.string().nullable(),
});

/** Cursor page; use `TItem` for typed `items` (handlers return concrete DTO arrays). */
export type PaginationCursorResponseDto<TItem = unknown> = {
	items: TItem[];
	nextCursor: string | null;
};

/**
 * Helper function to create a typed pagination cursor response schema
 */
export const createPaginationCursorResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
	z.object({
		items: z.array(itemSchema),
		nextCursor: z.string().nullable(),
	});

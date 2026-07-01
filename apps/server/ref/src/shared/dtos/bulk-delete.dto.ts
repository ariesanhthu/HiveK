import z from 'zod';

export const bulkDeleteSchema = z.object({
	ids: z
		.array(z.string('ID must be a string'), {
			error: 'ids must be an array of strings',
		})
		.min(1, 'At least one ID is required')
		.max(50, 'Maximum 50 items can be deleted at once'),
});

export type BulkDeleteDto = z.infer<typeof bulkDeleteSchema>;

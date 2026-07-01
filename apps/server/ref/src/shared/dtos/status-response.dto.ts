import z from 'zod';

export const statusResponseSchema = z.object({
	success: z.boolean(),
});

export type StatusResponseDto = z.infer<typeof statusResponseSchema>;

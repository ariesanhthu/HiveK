import z from 'zod';

export const successResponseSchema = z.object({
	success: z.boolean(),
	code: z.number(),
	timestamp: z.string(),
});

export const successResponseSchemaTemplate = successResponseSchema.extend({
	data: z.unknown(),
});

export type SuccessResponseDto = z.infer<typeof successResponseSchemaTemplate>;

export const errorResponseSchema = z.object({
	success: z.boolean(),
	code: z.number(),
	error: z.unknown(),
	message: z.string(),
	timestamp: z.string(),
});

export type ErrorResponseDto = z.infer<typeof errorResponseSchema>;

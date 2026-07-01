/**
 * Narrow unknown errors for logging and user-safe messages.
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string') return error;
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
}

export function getErrorStack(error: unknown): string | undefined {
	return error instanceof Error ? error.stack : undefined;
}

/** Chuyển unknown thành Error để rethrow (only-throw-error / preserve-caught-error). */
export function toError(error: unknown): Error {
	if (error instanceof Error) {
		return error;
	}
	return new Error(getErrorMessage(error), { cause: error });
}

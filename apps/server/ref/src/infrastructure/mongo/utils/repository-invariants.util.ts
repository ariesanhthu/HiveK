import { toError } from '@/shared/utils/error.util';
/** Guard dùng chung mongo repo — throw trong file riêng để ESLint resolve `Error` ổn định. */
export function invariant(condition: boolean, message: string): asserts condition {
	if (!condition) {
		const error: Error = new Error(message);
		throw toError(error);
	}
}

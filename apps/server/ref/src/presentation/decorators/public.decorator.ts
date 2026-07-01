import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public, bypassing mandatory authentication
 * while still allowing optional CASL evaluation.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

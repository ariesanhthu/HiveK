import { appConfig } from './app.config';

export * from './app.config';

/**
 * Array of all global configuration factories to be loaded by NestJS ConfigModule.forRoot()
 */
export const globalConfigs = [appConfig];

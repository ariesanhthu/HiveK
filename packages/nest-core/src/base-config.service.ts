import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

/**
 * Base Config Service that automatically transforms raw configurations
 * into the DTO class, validates it, and stores the validated config.
 */
export abstract class BaseConfigService<T extends object> {
  protected readonly config: T;

  constructor(dtoClass: new() => T, rawConfig: Record<string, any>) {
    const dtoInstance = plainToInstance(dtoClass, rawConfig, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(dtoInstance, { skipMissingProperties: false });
    if (errors.length > 0) {
      const validationErrors = errors
        .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(', ')}`)
        .join('\n');
      throw new Error(`[Config Validation Error] in ${dtoClass.name}:\n${validationErrors}`);
    }

    this.config = dtoInstance;
  }
}

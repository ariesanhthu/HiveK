import { IBaseRepository } from '../common/base.repository.interface';
import { PlatformRoot } from '../aggregate-roots/platform.aggregate';

export const PLATFORM_REPOSITORY = Symbol('PLATFORM_REPOSITORY');

export interface IPlatformRepository extends IBaseRepository<PlatformRoot> {
  findByName(name: string): Promise<PlatformRoot | null>;
}

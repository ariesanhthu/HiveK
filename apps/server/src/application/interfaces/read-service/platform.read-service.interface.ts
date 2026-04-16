import { IBaseReadService } from './base.read-service.interface';
import { PlatformDto, PlatformFilterDto } from '@/application/platforms/dtos';
import { Nullable } from '@/shared/types';

export const PLATFORM_READ_SERVICE = Symbol('PLATFORM_READ_SERVICE');

export interface IPlatformReadService extends IBaseReadService<PlatformDto, PlatformFilterDto> {
  findByName(name: string): Promise<Nullable<PlatformDto>>;
}

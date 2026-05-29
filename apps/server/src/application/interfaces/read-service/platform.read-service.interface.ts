import { IBaseReadService } from './base.read-service.interface';
import { PlatformDto } from '@/application/dtos';
import { PlatformFilterDto } from '@/application/queries';
import { Nullable } from '@/core/types';

export const PLATFORM_READ_SERVICE = Symbol('PLATFORM_READ_SERVICE');

export interface IPlatformReadService extends IBaseReadService<PlatformDto, PlatformFilterDto> {
  findByName(name: string): Promise<Nullable<PlatformDto>>;
}

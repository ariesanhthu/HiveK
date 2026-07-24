import { PlatformDetailDto } from '@/application/dtos';
import { PlatformFilterDto } from '@/application/queries';
import { Nullable } from '@/core/types';
import { IBaseReadService } from './base.read-service.interface';

export const PLATFORM_READ_SERVICE = Symbol('PLATFORM_READ_SERVICE');

export interface IPlatformReadService extends
  IBaseReadService<
    PlatformDetailDto,
    PlatformFilterDto
  >
{
  findByName(name: string): Promise<Nullable<PlatformDetailDto>>;
}

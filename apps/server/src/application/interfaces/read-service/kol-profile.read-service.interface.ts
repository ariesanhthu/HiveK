import { KolProfileDetailDto } from '@/application/dtos';
import { KolProfileFilterDto } from '@/application/queries';
import { Nullable } from '@core/types';
import { IBaseReadService } from './base.read-service.interface';

export const KOL_PROFILE_READ_SERVICE = Symbol('KOL_PROFILE_READ_SERVICE');

export interface IKolProfileReadService extends
  IBaseReadService<
    KolProfileDetailDto,
    KolProfileFilterDto
  >
{
  findByEmail(email: string): Promise<Nullable<KolProfileDetailDto>>;
  findByName(name: string): Promise<KolProfileDetailDto[]>;
}

import { IBaseReadService } from './base.read-service.interface';
import { KolProfileDto, KolProfileFilterDto } from '@/application/kol-profiles/dtos';
import { Nullable } from '@/shared/types/utility.type';

export const KOL_PROFILE_READ_SERVICE = Symbol('KOL_PROFILE_READ_SERVICE');

export interface IKolProfileReadService extends IBaseReadService<KolProfileDto, KolProfileFilterDto> {
  findByEmail(email: string): Promise<Nullable<KolProfileDto>>;
  findByName(name: string): Promise<KolProfileDto[]>;
}

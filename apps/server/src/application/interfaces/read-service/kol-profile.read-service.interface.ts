import { IBaseReadService } from './base.read-service.interface';
import { KolProfileDto } from '@/application/kol-profiles/dtos/kol-profile.dto';
import { Nullable } from '@/shared/types/utility.type';

export const KOL_PROFILE_READ_SERVICE = Symbol('KOL_PROFILE_READ_SERVICE');

export interface IKolProfileReadService extends IBaseReadService<KolProfileDto> {
  findByEmail(email: string): Promise<Nullable<KolProfileDto>>;
  findByName(name: string): Promise<KolProfileDto[]>;
}

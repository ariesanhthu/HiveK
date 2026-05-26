import { Nullable } from '@/shared/types';
import { KolProfileEntity } from '../entities/kol-profile.entity';

export interface IKolProfileRepository {
  findById(id: string): Promise<Nullable<KolProfileEntity>>;
  save(entity: KolProfileEntity): Promise<void>;
  delete(id: string): Promise<void>;
}

export const KOL_PROFILE_REPOSITORY = Symbol('IKolProfileRepository');

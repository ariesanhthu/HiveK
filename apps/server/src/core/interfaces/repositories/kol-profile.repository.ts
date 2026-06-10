import { Nullable } from '@/core/types';
import { KolProfileEntity } from '../../entities/kol-profile.entity';

export interface IKolProfileRepository {
  findById(id: string): Promise<Nullable<KolProfileEntity>>;
  findByPlatformInfo(platformId: string, externalId: string): Promise<Nullable<KolProfileEntity>>;
  findByUserId(userId: string): Promise<Nullable<KolProfileEntity>>;
  existsByPlatformId(platformId: string): Promise<boolean>;
  save(entity: KolProfileEntity): Promise<void>;
  saveMany(entities: KolProfileEntity[]): Promise<void>;
  delete(id: string): Promise<void>;
}

export const KOL_PROFILE_REPOSITORY = Symbol('IKolProfileRepository');

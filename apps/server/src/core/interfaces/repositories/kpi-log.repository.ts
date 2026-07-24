import { KpiLogEntity } from '@/core/entities/kpi-log.entity';
import { Nullable } from '@/core/types';

export interface IKpiLogRepository {
  findById(id: string): Promise<Nullable<KpiLogEntity>>;
  save(entity: KpiLogEntity): Promise<void>;
  saveMany(entities: KpiLogEntity[]): Promise<void>;
  delete(id: string): Promise<void>;
}

export const KPI_LOG_REPOSITORY = Symbol('IKpiLogRepository');

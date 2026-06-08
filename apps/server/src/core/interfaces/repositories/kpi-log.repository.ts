import { Nullable } from '@/core/types';
import { KpiLogEntity } from '@/core/entities/kpi-log.entity';

export interface IKpiLogRepository {
  findById(id: string): Promise<Nullable<KpiLogEntity>>;
  save(entity: KpiLogEntity): Promise<void>;
  delete(id: string): Promise<void>;
}

export const KPI_LOG_REPOSITORY = Symbol('IKpiLogRepository');

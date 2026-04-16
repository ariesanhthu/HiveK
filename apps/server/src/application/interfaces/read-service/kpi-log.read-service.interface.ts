import { IBaseReadService } from './base.read-service.interface';
import { KpiLogDto, KpiLogFilterDto } from '@/application/analytics/dtos/kpi-log.dto';

export const KPI_LOG_READ_SERVICE = Symbol('KPI_LOG_READ_SERVICE');

export interface IKpiLogReadService extends IBaseReadService<KpiLogDto, KpiLogFilterDto> {}

import { KpiLogDto } from '@/application/dtos';
import { KpiLogFilterDto } from '@/application/queries';
import { IBaseReadService } from './base.read-service.interface';

export const KPI_LOG_READ_SERVICE = Symbol('KPI_LOG_READ_SERVICE');

export type IKpiLogReadService = IBaseReadService<
  KpiLogDto,
  KpiLogFilterDto
>;

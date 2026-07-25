import { IBaseReadService } from './base.read-service.interface';
import { PackageResponseDto } from '@/application/dtos';
import { PackageFilterDto } from '@/application/queries';

export const PACKAGE_READ_SERVICE = Symbol('PACKAGE_READ_SERVICE');

export interface IPackageReadService extends IBaseReadService<PackageResponseDto, PackageFilterDto> {
  findByCode(code: string): Promise<PackageResponseDto[]>;
  findByType(type: string): Promise<PackageResponseDto[]>;
  findPublicPackages(): Promise<PackageResponseDto[]>;
  findByEnterpriseId(enterpriseId: string): Promise<PackageResponseDto[]>;
}

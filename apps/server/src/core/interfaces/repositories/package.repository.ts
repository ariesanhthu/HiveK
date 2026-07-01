import { IBaseRepository } from '../../common';
import { PackageEntity } from '../../aggregate-roots/package.aggregate';
import { EPackageType } from '../../enums';

export interface IPackageRepository extends IBaseRepository<PackageEntity> {
  findByCode(code: string): Promise<PackageEntity[]>;
  findByType(type: EPackageType): Promise<PackageEntity[]>;
  findPublicPackages(): Promise<PackageEntity[]>;
  findByEnterpriseId(enterpriseId: string): Promise<PackageEntity[]>;
  deleteByCode(code: string): Promise<void>;
}

export const PACKAGE_REPOSITORY = Symbol('IPackageRepository');

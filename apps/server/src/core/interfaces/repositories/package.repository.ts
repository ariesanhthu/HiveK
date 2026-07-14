import { IBaseRepository } from '../../common';
import { PackageRoot } from '../../aggregate-roots/package.aggregate';
import { EPackageType } from '../../enums';

export interface IPackageRepository extends IBaseRepository<PackageRoot> {
  findByCode(code: string): Promise<PackageRoot[]>;
  findByType(type: EPackageType): Promise<PackageRoot[]>;
  findPublicPackages(): Promise<PackageRoot[]>;
  findByEnterpriseId(enterpriseId: string): Promise<PackageRoot[]>;
  deleteByCode(code: string): Promise<void>;
}

export const PACKAGE_REPOSITORY = Symbol('IPackageRepository');

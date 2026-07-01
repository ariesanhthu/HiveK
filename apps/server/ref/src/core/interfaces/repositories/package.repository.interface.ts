import { type IRepository } from '@/core/interfaces';
import { type PackageEntity } from '@/core/aggregate-roots';
import { type EPackageType } from '../../enums';

export const PACKAGE_REPOSITORY = Symbol('PACKAGE_REPOSITORY');

export interface IPackageRepository extends IRepository<PackageEntity> {
	findByCode(code: string): Promise<PackageEntity[]>;
	findByType(type: EPackageType): Promise<PackageEntity[]>;
	findPublicPackages(): Promise<PackageEntity[]>;
	findByEnterpriseId(enterpriseId: string): Promise<PackageEntity[]>;
	deleteByCode(code: string): Promise<void>;
}

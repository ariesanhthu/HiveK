import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
	type FilterQuery,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { PackageVariantEntity, PackageEntity } from '@/core';
import { PackageGetListDto } from '@/application/queries';
import { ESortOrder } from '@/shared/enums';
import { IPackageRepository } from '@/core';
import { PackageDocument, PackageModel, QuotaItemSchema } from '../schemas';
import { PackageFeatureVO, QuotaVO } from '@/core';
import { EVersionStatus, EPackageType, EPackageScope } from '@/core';
import { getDocDate } from '@/infrastructure/mongo/utils/document-timestamps';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { PAYMENT_TENANT_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoPackageRepository implements IPackageRepository {
	private readonly core: SgodMongooseRepositoryCore<PackageEntity>;

	constructor(
		@InjectModel(PackageModel.name)
		packageModel: Model<PackageDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(packageModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<PackageDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_TENANT_FILTER_CONFIG
		);
	}

	async create(entity: PackageEntity): Promise<PackageEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: PackageEntity): Promise<PackageEntity> {
		if (!entity.id) {
			return this.create(entity);
		}
		const scope =
			entity.enterpriseId !== undefined && entity.enterpriseId !== null
				? { tenantId: entity.enterpriseId }
				: undefined;
		const updated = await this.core.updateById(
			entity.id,
			entity,
			scope,
			sgodWriteOptionsFromSession(this.session)
		);
		if (!updated) {
			throw new Error(`Package not found: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<PackageEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async findByIds(ids: string[]): Promise<PackageEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: PackageGetListDto): Promise<PackageEntity[]> {
		const { limit, sortOrder, cursor, code, status, type, scope, enterpriseId } = filter;
		const query: FilterQuery = {};

		if (code) query.code = code;
		if (status) query.status = status;
		if (type) query.type = type;
		if (scope) query.scope = scope;
		if (cursor) {
			query._id = sortOrder === ESortOrder.ASC ? { $gt: cursor } : { $lt: cursor };
		}

		const tenantScope = enterpriseId ? { tenantId: enterpriseId } : undefined;
		const scoped = this.core.buildScopedFilter(query, tenantScope);
		let mongoQuery = this.core.getModel().find(scoped);
		if (limit) {
			mongoQuery = mongoQuery.limit(limit);
		}
		mongoQuery = mongoQuery.sort({ _id: sortOrder === ESortOrder.ASC ? 1 : -1 });
		if (this.session) {
			mongoQuery = mongoQuery.session(this.session);
		}
		const docs = await mongoQuery.exec();
		return docs.map((doc) => this.mapToEntity(doc as unknown as PackageDocument));
	}

	async findByCode(code: string): Promise<PackageEntity[]> {
		return this.core.findMany({ code }, undefined, findManyOptions(this.session));
	}

	async findByType(type: EPackageType): Promise<PackageEntity[]> {
		return this.core.findMany(
			{ type, status: EVersionStatus.ACTIVE },
			undefined,
			findManyOptions(this.session)
		);
	}

	async findPublicPackages(): Promise<PackageEntity[]> {
		return this.core.findMany(
			{ scope: EPackageScope.PUBLIC, status: EVersionStatus.ACTIVE },
			undefined,
			findManyOptions(this.session)
		);
	}

	async findByEnterpriseId(enterpriseId: string): Promise<PackageEntity[]> {
		return this.core.findMany(
			{ status: EVersionStatus.ACTIVE },
			{ tenantId: enterpriseId },
			findManyOptions(this.session)
		);
	}

	async deleteByCode(code: string): Promise<void> {
		await this.core.getModel().deleteMany({ code }, { session: this.session }).exec();
	}

	private mapToEntity(doc: PackageDocument): PackageEntity {
		const baseQuotasRecord = (doc.base_quotas || []).reduce<Record<string, number>>(
			(acc, curr) => {
				acc[curr.code] = curr.limit;
				return acc;
			},
			{}
		);

		return PackageEntity.instantiate(
			documentIdString(doc)!,
			{
				code: doc.code,
				name: doc.name,
				description: doc.description,
				type: doc.get('type'),
				scope: doc.get('scope'),
				enterpriseId: doc.enterprise_id,
				status: doc.status,
				features: (doc.features || []).map(
					(f) => new PackageFeatureVO({ code: f.code, permissions: f.permissions })
				),
				baseQuotas: new QuotaVO(baseQuotasRecord),
				variants: (doc.variants || []).map((v) => {
					const extraQuotasRecord = (v.extra_quotas ?? []).reduce<Record<string, number>>(
						(acc, curr: QuotaItemSchema) => {
							acc[curr.code] = curr.limit;
							return acc;
						},
						{}
					);

					return PackageVariantEntity.instantiate(
						documentIdString(v)!,
						{
							title: v.title,
							durationMonths: v.duration_months,
							price: v.price,
							priceAfterDiscount: v.price_after_discount,
							tax: v.tax,
							currency: v.currency,
							extraQuotas: new QuotaVO(extraQuotasRecord),
						}
					);
				}),
				createdAt: getDocDate(doc, 'created_at'),
				updatedAt: getDocDate(doc, 'updated_at'),
				activatedAt: doc.activated_at || undefined,
			}
		);
	}

	private mapToPersistence(data: Partial<PackageEntity>): Record<string, unknown> {
		if (!(data instanceof PackageEntity)) {
			throw new Error('Package repository expects PackageEntity instance');
		}
		const includeVariantIds = Boolean(data.id);
		return {
			code: data.code,
			name: data.name,
			description: data.description,
			type: data.type,
			scope: data.scope,
			enterprise_id: data.enterpriseId ?? null,
			status: data.status,
			features: data.features.map((f) => ({
				code: f.code,
				permissions: f.permissions,
			})),
			base_quotas: Object.entries(data.baseQuotas.unmarshal).map(([code, limit]) => ({
				code,
				limit: Number(limit),
			})),
			variants: data.variants.map((v) => ({
				...(includeVariantIds && v.id ? { _id: v.id } : {}),
				title: v.title,
				duration_months: v.durationMonths,
				price: v.price,
				currency: v.currency,
				price_after_discount: v.priceAfterDiscount,
				tax: v.tax,
				extra_quotas: Object.entries(v.extraQuotas.unmarshal).map(([code, limit]) => ({
					code,
					limit: Number(limit),
				})),
			})),
			activated_at: data.activatedAt ?? null,
		};
	}
}

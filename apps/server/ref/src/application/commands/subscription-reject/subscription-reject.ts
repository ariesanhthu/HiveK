import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionRejectCommand } from './subscription-reject.command';
import {
	UNIT_OF_WORK,
	type IUnitOfWork,
	type ILoggerService,
	LOGGER_SERVICE,
	SubscriptionHistoryEntity,
	SubscriptionChangeDetailsVO,
	SubscriptionUpdatedEvent,
	QuotaVO,
	PackageEntity,
} from '@/core';
import { getErrorMessage, toError } from '@/shared/utils/error.util';
import { EVENT_SERVICE, type IEventService } from '@/core';

@CommandHandler(SubscriptionRejectCommand)
export class SubscriptionRejectHandler implements ICommandHandler<SubscriptionRejectCommand> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		@Inject(EVENT_SERVICE)
		private readonly eventService: IEventService
	) {
		this.logger.setContext(SubscriptionRejectHandler.name);
	}

	async execute(command: SubscriptionRejectCommand): Promise<void> {
		const { enterpriseId, invalidPermissions } = command.dto;
		this.logger.log(
			`Executing SubscriptionRejectCommand for enterprise: ${enterpriseId}, invalidPermissions: ${invalidPermissions.join(', ')}`
		);

		const maxRetries = 3;
		for (let attempt = 0; attempt < maxRetries; attempt++) {
			const session = await this.uow.start();
			try {
				// 1. Fetch subscription based on enterpriseId
				const subscription =
					await session.subscriptionRepository.findByEnterpriseId(enterpriseId);
				if (!subscription) {
					this.logger.warn(`No subscription found for enterprise: ${enterpriseId}`);
					await session.commit();
					return;
				}

				const subscriptionId = subscription.id;
				const originalVersion = subscription.version;

				const oldPackages = subscription.items.map((item) => item.packageId);
				const oldQuotas = subscription.computedQuotas;
				const oldPermissions = subscription.computedPermissions;

				// 2. Fetch packages belonging to that subscription
				if (oldPackages.length > 0) {
					const packages = await session.packageRepository.findByIds(oldPackages);

					// 3. Check in each package which one contains at least one permission that is in invalidPermissions.
					for (const pkg of packages) {
						const packagePermissions = pkg.features.flatMap((f) => f.permissions);
						const hasInvalidPermission = packagePermissions.some((perm) =>
							invalidPermissions.includes(perm)
						);

						if (hasInvalidPermission) {
							this.logger.log(
								`Archiving package ${pkg.id} (${pkg.name}) due to invalid permissions`
							);
							// 4. Change this package to ARCHIVE
							pkg.archive();
							await session.packageRepository.save(pkg);

							// Remove this package from subscription
							subscription.removePackage(pkg.id);
						}
					}

					// Recalculate computed fields for remaining packages in the subscription
					const remainingPackageIds = subscription.items.map((item) => item.packageId);
					const remainingPackages = packages.filter((pkg) =>
						remainingPackageIds.includes(pkg.id)
					);

					const newQuotas = this.aggregateQuotas(remainingPackages);
					const newPermissions = this.aggregatePermissions(remainingPackages);

					subscription.updateComputedFields(newQuotas, newPermissions);
				}

				// 5. Save subscription with version check
				await session.subscriptionRepository.updateWithVersion(
					subscriptionId,
					originalVersion,
					subscription
				);

				// 6. Create subscription history
				const subscriptionHistory = SubscriptionHistoryEntity.create({
					subscriptionId,
					enterpriseId,
					billId: undefined,
					actorId: undefined,
					details: new SubscriptionChangeDetailsVO({
						oldPackages,
						newPackages: subscription.items.map((item) => item.packageId),
						oldQuotas,
						newQuotas: subscription.computedQuotas,
						oldPermissions,
						newPermissions: subscription.computedPermissions,
					}),
					createdAt: new Date(),
				});

				await session.subscriptionHistoryRepository.create(subscriptionHistory);

				// 7. Publish SubscriptionUpdatedEvent to update other services
				subscription.recordSubscriptionUpdated(
					subscriptionHistory.id,
					subscriptionHistory.details
				);

				await this.eventService.publishEvents(subscription, session);

				await session.commit();
				this.logger.log(
					`Subscription for enterprise ${enterpriseId} has been successfully updated.`
				);
				return;
			} catch (error: unknown) {
				await session.rollback();

				const message = getErrorMessage(error);
				if (
					message.toLowerCase().includes('version conflict') &&
					attempt < maxRetries - 1
				) {
					this.logger.warn(
						`Version conflict detected. Retrying... (${attempt + 1}/${maxRetries})`
					);
					await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
					continue;
				}

				this.logger.error(`Failed to execute SubscriptionRejectCommand: ${message}`);
				throw toError(error);
			} finally {
				await session.end();
			}
		}

		throw new Error('Failed to execute SubscriptionRejectCommand after maximum retries');
	}

	private aggregateQuotas(packages: PackageEntity[]): QuotaVO {
		const aggregated: Record<string, number> = {};

		for (const pkg of packages) {
			const baseQuotas = pkg.baseQuotas.unmarshal;

			for (const [key, value] of Object.entries(baseQuotas)) {
				if (typeof value === 'number' && value !== null) {
					aggregated[key] = (aggregated[key] || 0) + value;
				}
			}

			for (const variant of pkg.variants || []) {
				if (variant.extraQuotas) {
					const extraQuotas = variant.extraQuotas.unmarshal;
					for (const [key, value] of Object.entries(extraQuotas)) {
						if (typeof value === 'number' && value !== null) {
							aggregated[key] = (aggregated[key] || 0) + value;
						}
					}
				}
			}
		}

		return new QuotaVO(aggregated);
	}

	private aggregatePermissions(packages: PackageEntity[]): string[] {
		const permissionsSet = new Set<string>();

		for (const pkg of packages) {
			for (const feature of pkg.features) {
				for (const permission of feature.permissions) {
					permissionsSet.add(permission);
				}
			}
		}

		return Array.from(permissionsSet);
	}
}

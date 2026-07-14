import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BillCreateCommand } from './bill-create.command';
import { BillResponseDto } from '@/application/dtos';
import { BillMapper } from '@/application/mappers';
import { BillService } from '@/application/services';
import { BillCreatedEvent } from '@/core/events';
import { PackageRoot, BillEntity } from '@/core/aggregate-roots';
import { EBillType, EBillStatus, EPackageType, ECurrency } from '@/core/enums';
import { BillMultiplePlanException } from '@/core/exceptions';
import { BILL_REPOSITORY, type IBillRepository } from '@/core/interfaces/repositories';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(BillCreateCommand)
export class BillCreateHandler implements ICommandHandler<BillCreateCommand, BillResponseDto> {
  constructor(
    private readonly billService: BillService,
    @Inject(BILL_REPOSITORY)
    private readonly billRepository: IBillRepository,
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: BillCreateCommand): Promise<BillResponseDto> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Validation: Versions & Variants Exist
      const packageIds = input.items.map((i) => i.packageId);
      const packages = (await Promise.all(
        packageIds.map((id) => this.packageRepository.findById(id))
      )).filter((p): p is PackageRoot => p !== null);

      const packageMap = new Map(packages.map((p) => [p.id, p]));

      const validatedItems = input.items.map((item) => {
        const pkg = packageMap.get(item.packageId);
        if (!pkg) {
          throw new Error(`Package not found: ${item.packageId}`);
        }
        const variant = pkg.variants.find((v) => v.id === item.packageVariantId);
        if (!variant) {
          throw new Error(
            `Package Variant not found: ${item.packageVariantId} in Package ${item.packageId}`
          );
        }
        return { pkg, variant };
      });

      // 2. Business Rules: Max 1 PLAN Package
      let planCount = 0;
      validatedItems.forEach((item) => {
        if (item.pkg.type === EPackageType.PLAN) {
          planCount++;
        }
      });

      if (planCount > 1) {
        throw new BillMultiplePlanException();
      }

      // 3. Logic: Determine purchase types by comparing with current subscription
      const items = await this.billService.determinePurchaseTypes(
        input.enterpriseId,
        validatedItems
      );

      // Set currency from first item
      const billCurrency = validatedItems[0]?.variant.currency || ECurrency.VND;

      // 4. Create Entity
      const bill = BillEntity.create({
        billCode: this.generateBillCode(),
        enterpriseId: input.enterpriseId,
        type: EBillType.PURCHASE,
        status: EBillStatus.PENDING,
        items,
        currency: billCurrency,
        createdAt: new Date(),
        expiresAt: null,
      });

      // 5. Persistence
      await this.billRepository.save(bill);

      // 6. Event
      this.eventBus.publish(
        new BillCreatedEvent(bill.id!, {
          billId: bill.id!,
          enterpriseId: bill.enterpriseId,
          totalAmount: bill.totalAmount,
          finalAmount: bill.finalAmount,
        })
      );

      // 7. Return DTO
      return BillMapper.toDto(bill);
    });
  }

  private generateBillCode(): string {
    return `BILL-${Date.now()}`;
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BillCalculateCommand } from './bill-calculate.command';
import { BillCalculateResponseDto } from '@/application/dtos';
import { BillMapper } from '@/application/mappers';
import { BillService } from '@/application/services';
import { PackageRoot } from '@/core/aggregate-roots';
import { BillEntity } from '@/core/aggregate-roots';
import { EBillType, EBillStatus, EPackageType, ECurrency } from '@/core/enums';
import { BillMultiplePlanException } from '@/core/exceptions';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';

@CommandHandler(BillCalculateCommand)
export class BillCalculateHandler implements ICommandHandler<BillCalculateCommand, BillCalculateResponseDto> {
  constructor(
    private readonly billService: BillService,
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async execute(command: BillCalculateCommand): Promise<BillCalculateResponseDto> {
    const { input } = command;

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
      input.enterpriseId || undefined,
      validatedItems
    );

    // Set currency from first item
    const billCurrency = validatedItems[0]?.variant.currency || ECurrency.VND;

    // 4. Create Entity (Ephemeral)
    const bill = BillEntity.create({
      billCode: 'PREVIEW',
      enterpriseId: '',
      type: EBillType.PURCHASE,
      status: EBillStatus.PENDING,
      items,
      currency: billCurrency,
      expiresAt: null,
    });

    // 5. Return mapped DTO (No persistence, No events)
    return BillMapper.toCalculateDto(bill);
  }
}

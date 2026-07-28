/**
 * Example: Event Service Usage in Command Handler
 *
 * Shows: How to call eventService.publishEvents() after saving an aggregate.
 * The events are persisted in the same Transaction Runner session as the aggregate,
 * then delivered asynchronously to Kafka via the outbox processor.
 *
 * See src/applications/commands/ for real handler implementations.
 */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ASSET_REPOSITORY, type AssetRepositoryPort } from '@domain/ports/repositories/asset.repository.port';
import { MONGO_TRANSACTION_RUNNER, type MongoTransactionRunnerPort } from '@domain/ports/services/mongo-transaction-runner.port';
import { EVENT_SERVICE, type IEventService } from '@applications/ports/event-service.interface';
import { AssetRoot } from '@domain/aggregate-roots/asset.root';
import { AssetCreateCommand } from './asset-create.command';
import { AssetDto } from '@applications/dtos/asset.dto';
import { AssetDtoMapper } from '@applications/mappers/asset-dto.mapper';

@CommandHandler(AssetCreateCommand)
export class AssetCreateHandler implements ICommandHandler<AssetCreateCommand, AssetDto> {
  constructor(
    @Inject(ASSET_REPOSITORY)
    private readonly repository: AssetRepositoryPort,
    @Inject(MONGO_TRANSACTION_RUNNER)
    private readonly mongoTx: MongoTransactionRunnerPort,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
  ) {}

  async execute(command: AssetCreateCommand): Promise<AssetDto> {
    // Step 1: Start Transaction Runner
    return this.mongoTx.runInTransaction(async (session) => {
      // Step 2: Create aggregate (domain rules enforced here)
      const asset = AssetRoot.create(command.props);

      // Step 3: Save aggregate (pass session explicitly)
      const saved = await this.repository.save(asset, { session });

      // Step 4: Publish domain events → outbox records
      // These are inserted in the same MongoDB transaction as the save
      await this.eventService.publishEvents(saved, session);

      // Step 5: Return DTO
      return AssetDtoMapper.toDto(saved);
    });
  }
}

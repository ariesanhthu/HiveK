import {
	Injectable,
	OnApplicationBootstrap,
	OnApplicationShutdown,
	Inject,
	Logger,
} from '@nestjs/common';
import { OUTBOX_REPOSITORY, type IOutboxRepository } from '@/core';
import { OutboxEventTechMapper } from './outbox-tech.mapper';
import { OutboxProcessorFactory } from './outbox-processor.factory';

@Injectable()
export class OutboxPollerService implements OnApplicationBootstrap, OnApplicationShutdown {
	private readonly logger = new Logger(OutboxPollerService.name);
	private isRunning = false;
	private pollTimer: NodeJS.Timeout | null = null;

	constructor(
		@Inject(OUTBOX_REPOSITORY)
		private readonly outboxRepository: IOutboxRepository,
		private readonly techMapper: OutboxEventTechMapper,
		private readonly processorFactory: OutboxProcessorFactory
	) {}

	onApplicationBootstrap() {
		this.logger.log('Starting Outbox Poller service...');
		this.isRunning = true;
		this.schedulePoll();
	}

	onApplicationShutdown() {
		this.logger.log('Stopping Outbox Poller service...');
		this.isRunning = false;
		if (this.pollTimer) {
			clearTimeout(this.pollTimer);
		}
	}

	private schedulePoll() {
		if (!this.isRunning) return;
		this.pollTimer = setTimeout(() => {
			void (async () => {
				try {
					await this.poll();
				} catch (error) {
					this.logger.error('Error in outbox poll cycle:', error);
				} finally {
					this.schedulePoll();
				}
			})();
		}, 5000); // Poll every 5 seconds
	}

	public async poll(): Promise<void> {
		// Find pending outbox events (limit to 10 at a time)
		const pendingEvents = await this.outboxRepository.findPending(10);
		if (pendingEvents.length === 0) return;

		this.logger.log(`Found ${pendingEvents.length} pending outbox events`);

		for (const event of pendingEvents) {
			try {
				// 1. Mark as processing to handle concurrency
				event.markAsProcessing();
				await this.outboxRepository.save(event);

				// 2. Map event to correct technology
				const tech = this.techMapper.getProcessorTech(event.eventType);
				const processor = this.processorFactory.getProcessor(tech);

				this.logger.log(
					`Processing outbox event ${event.id} (type: ${event.eventType}) using tech ${tech}`
				);

				// 3. Process event
				await processor.process(event);

				// 4. Mark as done
				event.markAsDone();
				await this.outboxRepository.save(event);
				this.logger.log(
					`Successfully processed outbox event ${event.id} and marked as done`
				);
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				this.logger.error(
					`Failed to process outbox event ${event.id}: ${errorMessage}`
				);
				event.markAsFailed(errorMessage);
				await this.outboxRepository.save(event);
			}
		}
	}
}

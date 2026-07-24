import { KpiLogCreateCommand, KpiLogTerminateCommand } from '@/application/commands';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class KpiLogRmqController {
  private readonly logger = new Logger(KpiLogRmqController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RmqHandler({ queue: 'server_kpi_queue', pattern: 'tracking.success' })
  async handleTrackingSuccess(data: any) {
    this.logger.log(
      `📥 Received tracking.success via RMQ: ${JSON.stringify(data)}`,
    );
    try {
      await this.commandBus.execute(new KpiLogCreateCommand(data));
    } catch (error) {
      this.logger.error(
        `Error processing tracking.success: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to trigger NACK/Requeue if configured
    }
  }

  @RmqHandler({ queue: 'server_kpi_queue', pattern: 'tracking.terminated' })
  async handleTrackingTerminated(data: any) {
    this.logger.log(
      `📥 Received tracking.terminated via RMQ: ${JSON.stringify(data)}`,
    );
    try {
      await this.commandBus.execute(new KpiLogTerminateCommand(data));
    } catch (error) {
      this.logger.error(
        `Error processing tracking.terminated: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

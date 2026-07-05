import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OutboxEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(): void {
    this.eventEmitter.emit('outbox.new');
  }
}

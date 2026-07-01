export interface IEventMessage {
	topic: string;
	key?: string;
	value: unknown;
	headers?: Record<string, unknown>;
}

export interface IEventBus {
	publish(event: IEventMessage): Promise<void>;
	publishMany(events: IEventMessage[]): Promise<void>;
}

export const EVENT_BUS = Symbol('IEventBus');

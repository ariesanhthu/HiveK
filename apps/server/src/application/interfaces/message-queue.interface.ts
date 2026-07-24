export const MESSAGE_QUEUE_SERVICE = Symbol('IMessageQueueService');
export const RABBITMQ_CIENT = Symbol('RABBITMQ_CLIENT');

export interface IMessageQueueService {
  /**
   * Emit a fire-and-forget event.
   * @param pattern The message pattern (topic/routing key).
   * @param data The payload to send.
   */
  emit<TEvent = string, TData = Record<string, string | number | boolean>>(
    pattern: TEvent,
    data: TData,
  ): void;

  /**
   * Send a request-response message.
   * @param pattern The message pattern.
   * @param data The payload to send.
   * @returns A promise resolving to the result.
   */
  send<
    TResult = Record<string, string | number | boolean>,
    TInput = Record<string, string | number | boolean>,
  >(
    pattern: string | Record<string, string | number | boolean>,
    data: TInput,
  ): Promise<TResult>;
}

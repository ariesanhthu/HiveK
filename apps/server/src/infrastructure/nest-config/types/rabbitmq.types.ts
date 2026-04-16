/**
 * RabbitMQ Producer Configuration Contract
 * Maps to NestJS ClientOptions for ClientsModule
 * Language-neutral and suitable for multi-language implementations
 */
export interface RabbitMQProducerConfig {
  version: string;
  role: "producer";
  service: string;
  connection: {
    uri: string;
    vhost: string;
    heartbeat: number;
    connection_timeout_ms: number;
    reconnect: {
      enabled: boolean;
      initial_delay_ms: number;
      max_delay_ms: number;
      factor: number;
      max_retries: number;
    };
  };
  exchange_contract: {
    name: string;
    type: "direct" | "topic" | "fanout" | "headers";
    options: {
      durable: boolean;
      internal: boolean;
      autoDelete: boolean;
    };
  };
  routes: Record<string, string>;
  publish: {
    persistent: boolean;
    mandatory: boolean;
    publisher_confirms: boolean;
    delivery_mode: number;
    timeout_ms: number;
    retry: {
      max_attempts: number;
      backoff_ms: number;
      max_backoff_ms: number;
      factor: number;
      jitter: boolean;
    };
  };
  message_contract: {
    default_content_type: string;
    default_content_encoding: string;
    required_headers: string[];
  };
}

/**
 * RabbitMQ Consumer Configuration Contract
 * Maps to NestJS MicroserviceOptions for app.connectMicroservice()
 * Language-neutral and suitable for multi-language implementations
 */
export interface RabbitMQConsumerConfig {
  version: string;
  role: "consumer";
  service: string;
  uses_producer_contract: string;
  connection: {
    uri: string;
    vhost: string;
    heartbeat: number;
    connection_timeout_ms: number;
    reconnect: {
      enabled: boolean;
      initial_delay_ms: number;
      max_delay_ms: number;
      factor: number;
      max_retries: number;
    };
  };
  consume: {
    prefetch_count: number;
    no_ack: boolean;
    manual_ack: boolean;
    requeue_on_error: boolean;
  };
  queues: Array<{
    name: string;
    type: "quorum" | "classic";
    options: {
      durable: boolean;
      exclusive: boolean;
      autoDelete: boolean;
      arguments: Record<string, string | number | boolean | null>;
    };
    bindings: Array<{
      exchange: string;
      routing_key: string;
    }>;
  }>;
  validation: {
    require_exchange_contract_match: boolean;
    match_fields: string[];
  };
}

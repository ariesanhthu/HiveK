## 1. RabbitMQ Config Writing Guide (Split Producer/Consumer)

Use **2 files**:

- `rabbitmq.producer.config.json`: only publish contract (connection, exchange, routing keys, publish policy)
- `rabbitmq.consumer.config.json`: queue/binding/consume policy (and validate producer exchange contract)

> Rule of thumb: producer does **not** need to know which queue consumes messages.

### 1.1 Producer Config (`rabbitmq.producer.config.json`)

| Field | Meaning | Type | Nullable | Allowed / Example values |
|---|---|---|---|---|
| `version` | Config schema version | `string` | No | `"1.0.0"` |
| `role` | Config owner role | `string` | No | Must be `"producer"` |
| `service` | Producer service identity | `string` | No | `"hivek.server"` |
| `connection.uri` | Broker URI | `string` | No | `"amqp://user:pass@host:5672/"` |
| `connection.vhost` | RabbitMQ virtual host | `string` | No | `"/"`, `"/orders"` |
| `connection.heartbeat` | AMQP heartbeat seconds | `number` | No | `30`, `60` |
| `connection.connection_timeout_ms` | Connect timeout | `number` | No | `5000`, `10000` |
| `connection.reconnect.enabled` | Auto reconnect | `boolean` | No | `true`, `false` |
| `connection.reconnect.initial_delay_ms` | First retry delay | `number` | No | `500`, `1000` |
| `connection.reconnect.max_delay_ms` | Max retry delay | `number` | No | `10000`, `30000` |
| `connection.reconnect.factor` | Exponential backoff factor | `number` | No | `1.5`, `2` |
| `connection.reconnect.max_retries` | Retry limit (`-1` = unlimited) | `number` | No | `-1`, `10` |
| `exchange_contract.name` | Exchange name used by producer | `string` | No | `"order_events_exchange"` |
| `exchange_contract.type` | Exchange type | `string` | No | `"direct"`, `"topic"`, `"fanout"`, `"headers"` |
| `exchange_contract.options.durable` | Exchange survives restart | `boolean` | No | `true` |
| `exchange_contract.options.internal` | Exchange cannot be published to directly | `boolean` | No | `false` |
| `exchange_contract.options.autoDelete` | Auto-delete exchange when unused | `boolean` | No | `false` |
| `routes` | Logical event to routing key map | `object<string,string>` | No | `{ "order.created": "order.created" }` |
| `publish.persistent` | Persist message to disk | `boolean` | No | `true` |
| `publish.mandatory` | Return unroutable messages | `boolean` | No | `true` |
| `publish.publisher_confirms` | Wait broker publish confirm | `boolean` | No | `true` |
| `publish.delivery_mode` | AMQP delivery mode | `number` | No | `1` (transient), `2` (persistent) |
| `publish.timeout_ms` | Publish operation timeout | `number` | No | `3000`, `5000` |
| `publish.retry.max_attempts` | Publish retry attempts | `number` | No | `3`, `5` |
| `publish.retry.backoff_ms` | Initial publish retry delay | `number` | No | `500`, `1000` |
| `publish.retry.max_backoff_ms` | Max publish retry delay | `number` | No | `10000`, `30000` |
| `publish.retry.factor` | Retry backoff multiplier | `number` | No | `1.5`, `2` |
| `publish.retry.jitter` | Randomize retry delay | `boolean` | No | `true` |
| `message_contract.default_content_type` | Default MIME type | `string` | No | `"application/json"` |
| `message_contract.default_content_encoding` | Default encoding | `string` | No | `"utf-8"` |
| `message_contract.required_headers` | Required metadata headers | `string[]` | No | `["message_id", "correlation_id"]` |

### 1.2 Consumer Config (`rabbitmq.consumer.config.json`)

| Field | Meaning | Type | Nullable | Allowed / Example values |
|---|---|---|---|---|
| `version` | Config schema version | `string` | No | `"1.0.0"` |
| `role` | Config owner role | `string` | No | Must be `"consumer"` |
| `service` | Consumer service identity | `string` | No | `"python.order-worker"` |
| `uses_producer_contract` | Path/reference to producer contract | `string` | No | `"./rabbitmq.producer.config.json"` |
| `connection.*` | Same meaning as producer `connection.*` | same types | No | Keep broker parameters consistent |
| `consume.prefetch_count` | Max unacked messages per consumer channel | `number` | No | `1`, `10`, `50` |
| `consume.no_ack` | Auto-ack without manual ack call | `boolean` | No | Usually `false` |
| `consume.manual_ack` | Explicit `ack/nack` by handler | `boolean` | No | Usually `true` |
| `consume.requeue_on_error` | Requeue failed message | `boolean` | No | `false` for poison-message safety |
| `queues` | Consumer-owned queues | `Array<object>` | No | One or many queue objects |
| `queues[].name` | Queue name | `string` | No | `"process_order_queue"` |
| `queues[].type` | Queue type hint | `string` | No | `"quorum"`, `"classic"` |
| `queues[].options.durable` | Queue survives restart | `boolean` | No | `true` |
| `queues[].options.exclusive` | Queue only for current connection | `boolean` | No | Usually `false` |
| `queues[].options.autoDelete` | Auto-delete queue when unused | `boolean` | No | Usually `false` |
| `queues[].options.arguments` | RabbitMQ queue args | `Record<string, string \| number \| boolean \| null>` | Yes (per argument value) | e.g. `x-message-ttl`, `x-dead-letter-exchange`, `x-queue-type` |
| `queues[].bindings` | Queue to exchange bindings | `Array<object>` | No | One queue can have many bindings |
| `queues[].bindings[].exchange` | Target exchange | `string` | No | `"order_events_exchange"` |
| `queues[].bindings[].routing_key` | Routing key filter | `string` | No | `"order.created"`, `"order.*"` |
| `validation.require_exchange_contract_match` | Enforce exchange compatibility check | `boolean` | No | `true` |
| `validation.match_fields` | Producer fields that must match | `string[]` | No | `["exchange_contract.name", "exchange_contract.type"]` |

### 1.3 Minimal Pattern

1. Producer publishes to `exchange_contract.name` with routing key from `routes`.
2. Each consumer creates its own `queues[]` and `bindings[]`.
3. Consumer validates producer exchange contract before consuming.

This allows many consumers to use the same exchange with different queues safely.
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class ReconnectConfig(BaseModel):
    enabled: bool = True
    initial_delay_ms: int = 1000
    max_delay_ms: int = 30000
    factor: int = 2
    max_retries: int = -1

class ConnectionConfig(BaseModel):
    uri: str
    vhost: str = "/"
    heartbeat: int = 60
    connection_timeout_ms: int = 10000
    reconnect: ReconnectConfig = Field(default_factory=lambda: ReconnectConfig(enabled=True))

class ConsumeConfig(BaseModel):
    prefetch_count: int = 10
    no_ack: bool = False
    manual_ack: bool = True
    requeue_on_error: bool = False

class BindingConfig(BaseModel):
    exchange: str
    routing_key: str

class QueueOptions(BaseModel):
    durable: bool = True
    exclusive: bool = False
    autoDelete: bool = False
    arguments: Dict[str, Any] = {}

class QueueConfig(BaseModel):
    name: str
    type: str = "classic"
    options: QueueOptions = Field(default_factory=QueueOptions)
    bindings: List[BindingConfig] = []

class ValidationConfig(BaseModel):
    require_exchange_contract_match: bool = True
    match_fields: List[str] = ["exchange_contract.name", "exchange_contract.type"]

class RMQConsumerConfig(BaseModel):
    version: str = "1.0.0"
    role: str = "consumer"
    service: str
    uses_producer_contract: Optional[str] = None
    connection: ConnectionConfig
    consume: ConsumeConfig = Field(default_factory=ConsumeConfig)
    queues: List[QueueConfig] = []
    validation: Optional[ValidationConfig] = None

class ExchangeOptions(BaseModel):
    durable: bool = True
    internal: bool = False
    autoDelete: bool = False

class ExchangeContract(BaseModel):
    name: str
    type: str = "direct"
    options: ExchangeOptions = Field(default_factory=ExchangeOptions)

class PublishRetryConfig(BaseModel):
    max_attempts: int = 5
    backoff_ms: int = 1000
    max_backoff_ms: int = 30000
    factor: int = 2
    jitter: bool = True

class PublishConfig(BaseModel):
    persistent: bool = True
    mandatory: bool = True
    publisher_confirms: bool = True
    delivery_mode: int = 2
    timeout_ms: int = 5000
    retry: PublishRetryConfig = Field(default_factory=PublishRetryConfig)

class MessageContract(BaseModel):
    default_content_type: str = "application/json"
    default_content_encoding: str = "utf-8"
    required_headers: List[str] = []

class RMQProducerConfig(BaseModel):
    version: str = "1.0.0"
    role: str = "producer"
    service: str
    connection: ConnectionConfig
    exchange_contract: ExchangeContract
    routes: Dict[str, str] = {}
    publish: PublishConfig = Field(default_factory=PublishConfig)
    message_contract: MessageContract = Field(default_factory=MessageContract)

import json
import logging
import os
from typing import Callable, Optional, Dict, List
import aio_pika
from .models import RMQConsumerConfig, RMQProducerConfig
from infrastructure.di.decorators import Injectable
from infrastructure.monitoring.interface import IMonitoringService
from infrastructure.config import settings

@Injectable()
class RabbitMQBroker:
    def __init__(self, monitor: IMonitoringService):
        self._consumer_config_path = settings.rmq_consumer_config_path
        self._monitor = monitor
        self._consumer_config: Optional[RMQConsumerConfig] = None
        self._producer_config: Optional[RMQProducerConfig] = None
        
        self._connection: Optional[aio_pika.RobustConnection] = None
        self._channel: Optional[aio_pika.RobustChannel] = None

    async def on_init(self):
        """Standardized async initialization called by the DI Container."""
        await self.initialize()

    async def initialize(self):
        """Load configs, connect, and setup topology (exchanges, queues, bindings)."""
        # 1. Load Consumer Config
        self._consumer_config = self._load_json_config(self._consumer_config_path, RMQConsumerConfig)
        
        # 2. Load Producer Config (for fallback) if specified
        if self._consumer_config.uses_producer_contract:
            # Resolve path relative to consumer config location
            base_dir = os.path.dirname(self._consumer_config_path)
            # The JSON says "./rabbitmq.producer.config.json" but we use rmq.producer.config.json
            # Correcting for the naming mismatch mentioned by user or detected by listing
            producer_filename = self._consumer_config.uses_producer_contract.replace("rabbitmq.", "rmq.")
            producer_path = os.path.join(base_dir, producer_filename)
            
            if os.path.exists(producer_path):
                self._producer_config = self._load_json_config(producer_path, RMQProducerConfig)
            else:
                self._monitor.warn(f"Producer contract specified but file not found at {producer_path}")

        # 3. Establish Connection
        self._connection = await aio_pika.connect_robust(
            self._consumer_config.connection.uri,
            heartbeat=self._consumer_config.connection.heartbeat,
            timeout=self._consumer_config.connection.connection_timeout_ms / 1000
        )
        
        self._channel = await self._connection.channel()
        await self._channel.set_qos(prefetch_count=self._consumer_config.consume.prefetch_count)
        
        # 4. Fallback: Setup Exchanges from Producer Contract
        if self._producer_config:
            self._monitor.info(f"Setting up fallback exchange: {self._producer_config.exchange_contract.name}")
            await self._channel.declare_exchange(
                name=self._producer_config.exchange_contract.name,
                type=self._producer_config.exchange_contract.type,
                durable=self._producer_config.exchange_contract.options.durable,
                auto_delete=self._producer_config.exchange_contract.options.autoDelete,
                internal=self._producer_config.exchange_contract.options.internal
            )

        # 5. Setup Queues and Bindings from Consumer Contract
        for q_cfg in self._consumer_config.queues:
            self._monitor.info(f"Declaring queue: {q_cfg.name} (Type: {q_cfg.type})")
            
            queue = await self._channel.declare_queue(
                name=q_cfg.name,
                durable=q_cfg.options.durable,
                exclusive=q_cfg.options.exclusive,
                auto_delete=q_cfg.options.autoDelete,
                arguments=q_cfg.options.arguments
            )
            
            for binding in q_cfg.bindings:
                self._monitor.info(f"Binding queue {q_cfg.name} to exchange {binding.exchange} with key {binding.routing_key}")
                await queue.bind(
                    exchange=binding.exchange,
                    routing_key=binding.routing_key
                )
        
        self._monitor.success("✅ RabbitMQ Broker initialization complete.")

    async def start_consumers(self, callbacks: Dict[str, Callable]):
        """
        Start consuming from queues.
        callbacks: Dict mapping queue names to async functions.
        """
        if not self._channel:
            raise RuntimeError("Broker not initialized. Call initialize() first.")

        for queue_name, callback in callbacks.items():
            queue = await self._channel.get_queue(queue_name)
            await queue.consume(callback)
            self._monitor.info(f"Started consumer for queue: {queue_name}")

    def get_queue_names(self) -> List[str]:
        """Return the names of all queues defined in the consumer contract."""
        if not self._consumer_config:
            return []
        return [q.name for q in self._consumer_config.queues]

    def _load_json_config(self, path: str, model_class):
        try:
            with open(path, "r") as f:
                data = json.load(f)
                return model_class(**data)
        except Exception as e:
            self._monitor.error(f"Failed to load RMQ config from {path}: {str(e)}")
            raise

    async def close(self):
        if self._connection:
            await self._connection.close()

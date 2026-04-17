import asyncio
import json
import os
import sys
import uuid
from datetime import datetime

# Ensure src is in PYTHONPATH
sys.path.append(os.path.join(os.getcwd(), "src"))

import aio_pika
from infrastructure.messaging.rabbitmq.models import RMQProducerConfig
from infrastructure.config import settings

async def send_test_message(config_path: str, routing_key: str, payload: dict):
    print(f"--- Mock Producer: Sending Message ---")
    
    # 1. Load Producer Contract
    if not os.path.exists(config_path):
        print(f"❌ Error: Config file not found at {config_path}")
        return

    with open(config_path, "r") as f:
        data = json.load(f)
        config = RMQProducerConfig(**data)

    print(f"✅ Loaded Producer Contract: {config.service}")

    # 2. Connect
    connection = await aio_pika.connect_robust(config.connection.uri)
    async with connection:
        channel = await connection.channel()
        
        # 3. Declare Exchange (Ensure it exists)
        exchange = await channel.declare_exchange(
            name=config.exchange_contract.name,
            type=config.exchange_contract.type,
            durable=config.exchange_contract.options.durable
        )
        
        # 4. Prepare Message
        message_body = json.dumps(payload).encode()
        message = aio_pika.Message(
            body=message_body,
            content_type="application/json",
            correlation_id=str(uuid.uuid4()),
            headers={
                "message_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat()
            },
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT if config.publish.persistent else aio_pika.DeliveryMode.NOT_PERSISTENT
        )

        # 5. Publish
        print(f"🚀 Publishing to '{config.exchange_contract.name}' with key '{routing_key}'...")
        await exchange.publish(message, routing_key=routing_key)
        
        print("✅ Message published successfully!")

async def main():
    # Use the kpi_scrape producer by default
    default_config = os.path.join(os.getcwd(), "src/config/rmq/test/producer.config.json")
    
    # Test Payload (ScrapeKpiRequest)
    payload = {
        "url": "https://www.tiktok.com/@example/video/123456789",
        "participant_id": "user_123"
    }
    
    # You can change these to match your test/ folder if preferred
    config_path = sys.argv[1] if len(sys.argv) > 1 else default_config
    routing_key = sys.argv[2] if len(sys.argv) > 2 else "test_event"

    await send_test_message(config_path, routing_key, payload)

if __name__ == "__main__":
    asyncio.run(main())

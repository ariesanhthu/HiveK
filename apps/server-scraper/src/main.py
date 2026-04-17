import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from infrastructure.config import settings
from infrastructure.di.container import Container

# Import interfaces
from infrastructure.monitoring.interface import IMonitoringService
from core.interfaces.repository import IKpiRepository

# Import implementations (Crucial for @Injectable decorators to run)
import infrastructure.monitoring.logging_monitoring
import infrastructure.persistent.mongo_kpi_repository
from infrastructure.messaging.rabbitmq.broker import RabbitMQBroker
from presentation.consumers.kpi_scrape_consumer import KpiScrapeConsumer

async def bootstrap():
    """
    Bootstrap the application using DI Container:
    - Register non-injectable providers (Mongo Client)
    - Initialize infrastructure via Container.initialize_all()
    - Resolve and start components
    """
    
    # 1. Register manual providers
    mongo_client = AsyncIOMotorClient(settings.mongodb_uri)
    # Register the instance directly into the Singleton cache
    Container._instances[AsyncIOMotorClient] = mongo_client

    # 2. Initialize all Singleton Services (Broker, Monitor, etc.)
    # This invokes on_init() hooks defined in classes
    await Container.initialize_all()
    
    # 3. Resolve Root Components
    monitor = Container.get(IMonitoringService)
    broker = Container.get(RabbitMQBroker)
    consumer = Container.get(KpiScrapeConsumer)

    monitor.info("🚀 Starting Server Scraper via DI Container...")

    try:
        # Register consumers dynamically from the JSON contract
        queue_names = broker.get_queue_names()
        if not queue_names:
            monitor.warn("⚠️ No queues defined in the RabbitMQ contract.")
        else:
            primary_queue = queue_names[0]
            monitor.info(f"📡 Registering consumer for primary queue: {primary_queue}")
            
            await broker.start_consumers({
                primary_queue: consumer.on_message
            })

        # Keep the application running
        try:
            await asyncio.Future()
        finally:
            await broker.close()
            mongo_client.close()

    except Exception as e:
        # We try to use the monitor, but if it's the one that failed, we fallback to print
        try:
            monitor.error(f"❌ Failed to initialize Application: {str(e)}")
        except:
            print(f"❌ Critical Failure: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(bootstrap())
    except KeyboardInterrupt:
        print("👋 Shutting down gracefully...")

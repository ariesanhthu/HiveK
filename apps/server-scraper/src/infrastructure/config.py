import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    def __init__(self):
        self.mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.mongodb_db_name = os.getenv("MONGODB_DB_NAME", "hivek")
        self.collection_name = "kpi_logs"
        self.rabbitmq_uri = os.getenv("RABBITMQ_URI", "amqp://guest:guest@localhost/")
        
        # RMQ JSON Contracts
        self.rmq_config_dir = os.path.join(os.getcwd(), "src/config/rmq")
        self.rmq_consumer_config_name = os.getenv("RMQ_CONSUMER_CONFIG", "kpi_scrape/consumer-main.config.json")
        self.rmq_consumer_config_path = os.path.join(self.rmq_config_dir, self.rmq_consumer_config_name)

settings = Settings()

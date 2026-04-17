from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Optional
from core.entities.kpi_log import KpiLog, KpiMetrics
from core.interfaces.repository import IKpiRepository
from core.exceptions.domain_exceptions import PersistenceError
from infrastructure.di.decorators import Injectable
from infrastructure.config import settings
from core.interfaces.repository import IKpiRepository

@Injectable(token=IKpiRepository)
class MongoKpiRepository(IKpiRepository):
    def __init__(self, client: AsyncIOMotorClient):
        self._db = client[settings.mongodb_db_name]
        self._collection = self._db[settings.collection_name]

    async def ensure_collection(self):
        """
        Ensures the collection exists and is configured as a time-series collection.
        """
        try:
            collections = await self._db.list_collection_names()
            if settings.collection_name not in collections:
                await self._db.create_collection(
                    settings.collection_name,
                    timeseries={
                        'timeField': 'timestamp',
                        'metaField': 'participant_id',
                        'granularity': 'minutes'
                    }
                )
        except Exception as e:
            # If it already exists or there's a permission issue, we handle it gracefully
            # or log it in a real production app.
            pass

    async def save(self, log: KpiLog) -> None:
        try:
            document = {
                "timestamp": log.timestamp,
                "participant_id": log.participant_id,
                "metrics": {
                    "views": log.metrics.views,
                    "likes": log.metrics.likes,
                    "comments": log.metrics.comments,
                    "shares": log.metrics.shares
                }
            }
            await self._collection.insert_one(document)
        except Exception as e:
            raise PersistenceError(f"Failed to save KPI log to MongoDB: {str(e)}")

    async def get_latest_by_participant(self, participant_id: str) -> Optional[KpiLog]:
        try:
            # Sort by timestamp descending to get the latest
            doc = await self._collection.find_one(
                {"participant_id": participant_id},
                sort=[("timestamp", -1)]
            )
            
            if not doc:
                return None
            
            return KpiLog(
                participant_id=doc["participant_id"],
                timestamp=doc["timestamp"],
                metrics=KpiMetrics(
                    views=doc["metrics"]["views"],
                    likes=doc["metrics"]["likes"],
                    comments=doc["metrics"]["comments"],
                    shares=doc["metrics"]["shares"]
                )
            )
        except Exception as e:
            raise PersistenceError(f"Failed to retrieve latest KPI log: {str(e)}")

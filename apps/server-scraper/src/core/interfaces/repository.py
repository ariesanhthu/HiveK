from abc import ABC, abstractmethod
from core.entities.kpi_log import KpiLog


class IKpiRepository(ABC):
    @abstractmethod
    async def save(self, log: KpiLog) -> None:
        """
        Persists a KpiLog entity to the data store.
        
        Args:
            log: The KpiLog entity to save.
            
        Raises:
            PersistenceError: If the save operation fails.
        """
        pass

    @abstractmethod
    async def get_latest_by_participant(self, participant_id: str) -> KpiLog | None:
        """
        Retrieves the most recent KpiLog for a specific participant.
        
        Args:
            participant_id: The ID of the participant.
            
        Returns:
            KpiLog | None: The latest log entry if found, otherwise None.
        """
        pass

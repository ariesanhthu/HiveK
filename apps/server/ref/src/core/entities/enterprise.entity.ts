/**
 * Lightweight entity representing an Enterprise from external service.
 * Only contains fields needed by payment service for validation.
 */
export interface ExternalEnterpriseEntity {
	id: string;
	name: string;
	status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

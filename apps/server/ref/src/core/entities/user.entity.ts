/**
 * Lightweight entity representing a User from external auth service.
 * Only contains fields needed by payment service for validation.
 */
export interface ExternalUserEntity {
	id: string;
	email: string;
	status: 'ACTIVE' | 'INACTIVE';
}

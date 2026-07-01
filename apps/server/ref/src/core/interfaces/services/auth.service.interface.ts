export interface PermissionDto {
	id: string;
	name: string;
	description: string;
	category: string;
	action: string;
	subject: string;
}

export interface PermissionsResponseDto {
	permissions: PermissionDto[];
	total: number;
}

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

/**
 * Service interface for authentication-related operations.
 * Communicates with external auth service via gRPC.
 */
export interface IAuthService {
	/**
	 * Fetch permissions for a given user type.
	 * @param userType - User type (e.g., SGOD, ENTERPRISE)
	 * @returns Permissions response containing list of permissions and total count
	 */
	fetchPermissions(userType?: string): Promise<PermissionsResponseDto>;
}

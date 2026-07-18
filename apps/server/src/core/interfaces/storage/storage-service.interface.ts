export type StorageResourceType = 'image' | 'video' | 'raw';

export interface UploadResult {
  url: string;
  format: string;
  size: number;
  publicId: string;
}

export interface IStorageService {
  /**
   * Upload a file to the storage provider
   * @param file - The file buffer to upload
   * @param options - Optional configuration for the upload
   * @returns Upload result containing URL, format, and size
   */
  upload(
    file: Buffer,
    options?: {
      folder?: string;
      filename?: string;
    },
  ): Promise<UploadResult>;

  /**
   * Delete a file from the storage provider
   * @param publicId - The public ID or identifier of the file to delete
   * @param options - Optional configuration for deletion
   * @returns Success status
   */
  delete(
    publicId: string,
    options?: {
      resourceType?: StorageResourceType;
    },
  ): Promise<boolean>;

  /**
   * Bulk delete files from the storage provider
   * @param publicIds - Array of public IDs to delete
   * @param options - Optional configuration for deletion
   * @returns Results of deletion operations
   */
  bulkDelete(
    publicIds: string[],
    options?: {
      resourceType?: StorageResourceType;
    },
  ): Promise<{
    success: string[];
    failed: Array<{ publicId: string; error: string }>;
  }>;

  /**
   * Extract the public ID / identifier of a file from its URL
   * @param url - The public URL of the file
   * @returns The extracted public ID or null if invalid
   */
  extractPublicIdFromUrl(url: string): string | null;
}

export const STORAGE_SERVICE = Symbol('IStorageService');

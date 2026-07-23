import { CloudinaryConfig } from '@/configs';
import { IStorageService, StorageResourceType, UploadResult } from '@/core/interfaces/storage';
import { errorMessage, isEmpty, toError } from '@/shared/utils';
import { Injectable, Logger } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryStorageService implements IStorageService {
  private readonly logger = new Logger(CloudinaryStorageService.name);
  private readonly DEFAULT_FOLDER: string;
  constructor(private readonly cloudinaryConfig: CloudinaryConfig) {
    const cloudName = this.cloudinaryConfig.getCloudName();
    const apiKey = this.cloudinaryConfig.getApiKey();
    const apiSecret = this.cloudinaryConfig.getApiSecret();

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully configured. Uploads will fail.',
      );
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.DEFAULT_FOLDER = this.cloudinaryConfig.getUploadPreset();
  }

  /**
   * Upload file to Cloudinary
   */
  async upload(
    file: Buffer,
    options?: { folder?: string; filename?: string; },
  ): Promise<UploadResult> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options?.folder || this.DEFAULT_FOLDER,
          resource_type: 'auto',
          public_id: options?.filename,
        },
        (error, result) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          if (error) {
            this.logger.error(
              `Cloudinary upload error (${duration}ms): ${error.message}`,
            );
            reject(error);
          } else if (result) {
            this.logger.log(
              `Cloudinary upload successful (${duration}ms): ${result.public_id}`,
            );
            resolve(this.mapToUploadResult(result));
          } else {
            this.logger.error(
              `Cloudinary upload error (${duration}ms): No result returned`,
            );
            reject(new Error('No result returned from Cloudinary'));
          }
        },
      );
      uploadStream.end(file);
    });
  }

  /**
   * Delete file from Cloudinary
   */
  async delete(
    publicId: string,
    options?: { resourceType?: StorageResourceType; },
  ): Promise<boolean> {
    try {
      const startTime = Date.now();
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: options?.resourceType || 'image',
      });
      const duration = Date.now() - startTime;

      if (result.result === 'ok' || result.result === 'not found') {
        this.logger.log(
          `Deleted from Cloudinary (${duration}ms): ${publicId}`,
        );
        return true;
      }

      this.logger.warn(
        `Failed to delete from Cloudinary (${duration}ms): ${publicId}, result: ${result.result}`,
      );
      return false;
    } catch (error) {
      this.logger.error(
        `Error deleting from Cloudinary: ${publicId}, ${errorMessage(error)}`,
      );
      return false;
    }
  }

  /**
   * Bulk delete files from Cloudinary
   */
  async bulkDelete(
    publicIds: string[],
    options?: { resourceType?: StorageResourceType; },
  ): Promise<{
    success: string[];
    failed: Array<{ publicId: string; error: string; }>;
  }> {
    const startTime = Date.now();
    const results = {
      success: [] as string[],
      failed: [] as Array<{ publicId: string; error: string; }>,
    };

    if (isEmpty(publicIds)) {
      return results;
    }

    try {
      this.logger.log(`Starting bulk delete of ${publicIds.length} files from Cloudinary`);

      const apiResponse = await cloudinary.api.delete_resources(publicIds, {
        resource_type: options?.resourceType || 'image',
      });
      const deletedMap = apiResponse.deleted || {};

      publicIds.forEach((publicId) => {
        const status = deletedMap[publicId];
        if (status === 'deleted' || status === 'not_found') {
          results.success.push(publicId);
        } else {
          results.failed.push({
            publicId,
            error: status || 'Failed to delete or not found in Cloudinary response',
          });
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `Bulk delete completed (${duration}ms): ${results.success.length} succeeded, ${results.failed.length} failed`,
      );

      return results;
    } catch (error) {
      this.logger.warn(
        `Cloudinary bulk delete API failed (${
          errorMessage(error)
        }). Falling back to individual deletes.`,
      );

      const deletePromises = publicIds.map((publicId) =>
        this.delete(publicId, options)
          .then((success) => ({ success, publicId, error: success ? undefined : 'Delete failed' }))
          .catch((err) => ({ success: false, publicId, error: err.message }))
      );

      const deleteResults = await Promise.all(deletePromises);

      deleteResults.forEach((result) => {
        if (result.success) {
          results.success.push(result.publicId);
        } else {
          results.failed.push({
            publicId: result.publicId,
            error: result.error || 'Unknown error',
          });
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `Fallback bulk delete completed (${duration}ms): ${results.success.length} succeeded, ${results.failed.length} failed`,
      );

      return results;
    }
  }

  /**
   * Map Cloudinary response to UploadResult
   */
  private mapToUploadResult(result: UploadApiResponse): UploadResult {
    return {
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      publicId: result.public_id,
    };
  }

  /**
   * Extract Cloudinary public_id from URL
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
      const urlParts = url.split('/');
      const uploadIndex = urlParts.indexOf('upload');

      if (uploadIndex === -1) return null;

      // Get the part after 'upload' and version
      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');

      // Remove file extension
      const publicIdWithFolder = pathAfterUpload.substring(
        0,
        pathAfterUpload.lastIndexOf('.'),
      );

      return publicIdWithFolder;
    } catch (error) {
      this.logger.error(
        `Failed to extract public_id from URL: ${errorMessage(error)}`,
      );
      return null;
    }
  }
}

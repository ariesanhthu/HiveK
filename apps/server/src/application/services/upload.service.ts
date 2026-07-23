import { StorageResourceType } from '@/core/interfaces/storage';
import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

@Injectable()
export class UploadService {
  /**
   * Identifies the StorageResourceType ('image' | 'video' | 'raw') from format or mimetype.
   */
  getResourceType(formatOrMimetype: string): StorageResourceType {
    const images = [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
      'svg',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    const videos = [
      'mp4',
      'webm',
      'avi',
      'mov',
      'video/mp4',
      'video/webm',
      'video/x-msvideo',
      'video/quicktime',
    ];
    const normalized = formatOrMimetype.toLowerCase();

    if (images.some(img => normalized.includes(img))) return 'image';
    if (videos.some(vid => normalized.includes(vid))) return 'video';
    return 'raw';
  }

  /**
   * Processes a file buffer, ensuring it respects the 2MB size limit.
   * If it is an image and exceeds 2MB, automatically downscales and compresses it.
   */
  async processAndValidateFile(
    buffer: Buffer,
    mimetype: string,
    originalName: string,
  ): Promise<{ buffer: Buffer; size: number; }> {
    let currentBuffer = buffer;
    let size = currentBuffer.length;

    if (size > MAX_FILE_SIZE) {
      if (mimetype.startsWith('image/') || this.getResourceType(mimetype) === 'image') {
        try {
          // Attempt 1: Compress image
          let sharpInstance = sharp(currentBuffer);
          const metadata = await sharpInstance.metadata();

          // Resize to a maximum width of 1920 to reduce size
          const newWidth = metadata.width && metadata.width > 1920 ? 1920 : undefined;
          if (newWidth) {
            sharpInstance = sharpInstance.resize({ width: newWidth });
          }

          // Output based on format with standard quality reduction
          if (metadata.format === 'png') {
            currentBuffer = await sharpInstance.png({ quality: 75, compressionLevel: 8 })
              .toBuffer();
          } else if (metadata.format === 'webp') {
            currentBuffer = await sharpInstance.webp({ quality: 75 }).toBuffer();
          } else {
            // Default to jpeg/jpg
            currentBuffer = await sharpInstance.jpeg({ quality: 75 }).toBuffer();
          }

          size = currentBuffer.length;

          // Attempt 2: If still > 2MB, compress even harder and downscale further
          if (size > MAX_FILE_SIZE) {
            let sharpInstanceHard = sharp(currentBuffer);
            const newWidthHard = newWidth
              || (metadata.width ? Math.min(metadata.width, 1280) : 1280);
            sharpInstanceHard = sharpInstanceHard.resize({ width: newWidthHard });

            currentBuffer = await sharpInstanceHard.jpeg({ quality: 50 }).toBuffer();
            size = currentBuffer.length;
          }

          if (size > MAX_FILE_SIZE) {
            throw new BadRequestException('Image could not be compressed under the 2MB limit');
          }
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new BadRequestException(`Failed to compress image: ${error.message}`);
        }
      } else {
        throw new BadRequestException('File size exceeds the 2MB limit');
      }
    }

    return { buffer: currentBuffer, size };
  }
}

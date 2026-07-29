import { Injectable, Inject } from '@nestjs/common';
import { StorageResourceType } from '@/core/interfaces/storage';
import {
  IMAGE_PROCESSOR_SERVICE,
  type IImageProcessorService,
} from '@/application/interfaces';

@Injectable()
export class UploadService {
  constructor(
    @Inject(IMAGE_PROCESSOR_SERVICE)
    private readonly imageProcessor: IImageProcessorService,
  ) {}

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

    if (images.some((img) => normalized.includes(img))) return 'image';
    if (videos.some((vid) => normalized.includes(vid))) return 'video';
    return 'raw';
  }

  /**
   * Processes a file buffer, delegates to image processor.
   */
  async processAndValidateFile(
    buffer: Buffer,
    mimetype: string,
    originalName: string,
  ): Promise<{ buffer: Buffer; size: number }> {
    return this.imageProcessor.compress(buffer, mimetype);
  }
}

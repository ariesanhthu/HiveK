export interface IImageProcessorService {
  compress(buffer: Buffer, mimetype: string): Promise<{ buffer: Buffer; size: number }>;
}

export const IMAGE_PROCESSOR_SERVICE = Symbol('IImageProcessorService');

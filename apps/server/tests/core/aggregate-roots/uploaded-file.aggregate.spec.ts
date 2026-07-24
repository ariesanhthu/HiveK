import {
  UploadedFileCreateProps,
  UploadedFileRoot,
} from '@core/aggregate-roots/uploaded-file.aggregate';
import { TargetType } from '@core/enums';

describe('UploadedFileRoot Aggregate Root', () => {
  const defaultCreateProps: UploadedFileCreateProps = {
    url: 'https://cloudinary.com/test.jpg',
    publicId: 'test-public-id',
    size: 102400,
    format: 'jpg',
    targetType: TargetType.USER,
    targetId: 'user-123',
    targetField: 'avatar',
  };

  describe('create', () => {
    it('should create uploaded file with all fields', () => {
      const file = UploadedFileRoot.create(defaultCreateProps);

      expect(file).toBeDefined();
      expect(file.url).toBe('https://cloudinary.com/test.jpg');
      expect(file.publicId).toBe('test-public-id');
      expect(file.size).toBe(102400);
      expect(file.format).toBe('jpg');
      expect(file.targetType).toBe(TargetType.USER);
      expect(file.targetId).toBe('user-123');
      expect(file.targetField).toBe('avatar');
      expect(file.title).toBeNull();
      expect(file.deleteAt).toBeNull();
      expect(file.deleteBy).toBeNull();
      expect(file.createdAt).toBeInstanceOf(Date);
      expect(file.updatedAt).toBeInstanceOf(Date);
    });

    it('should create with optional title', () => {
      const props: UploadedFileCreateProps = {
        ...defaultCreateProps,
        title: 'My Avatar',
      };
      const file = UploadedFileRoot.create(props);
      expect(file.title).toBe('My Avatar');
    });
  });

  describe('instantiate', () => {
    it('should restore existing file with id', () => {
      const now = new Date();
      const file = UploadedFileRoot.instantiate('file-123', {
        ...defaultCreateProps,
        title: null,
        deleteAt: null,
        deleteBy: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(file).toBeDefined();
      expect(file.id).toBe('file-123');
      expect(file.url).toBe('https://cloudinary.com/test.jpg');
    });
  });

  describe('softDelete & restore', () => {
    it('should soft delete with deletor info', () => {
      const file = UploadedFileRoot.create(defaultCreateProps);
      file.softDelete('admin-1');

      expect(file.deleteAt).toBeInstanceOf(Date);
      expect(file.deleteBy).toBe('admin-1');
    });

    it('should restore after soft delete', () => {
      const file = UploadedFileRoot.create(defaultCreateProps);
      file.softDelete('admin-1');
      expect(file.deleteAt).not.toBeNull();

      file.restore();

      expect(file.deleteAt).toBeNull();
      expect(file.deleteBy).toBeNull();
    });

    it('should be idempotent on restore when not deleted', () => {
      const file = UploadedFileRoot.create(defaultCreateProps);
      expect(file.deleteAt).toBeNull();

      file.restore();

      expect(file.deleteAt).toBeNull();
      expect(file.deleteBy).toBeNull();
    });
  });

  describe('equals', () => {
    it('should return true for same id', () => {
      const now = new Date();
      const f1 = UploadedFileRoot.instantiate('file-1', {
        ...defaultCreateProps,
        title: null,
        deleteAt: null,
        deleteBy: null,
        createdAt: now,
        updatedAt: now,
      });
      const f2 = UploadedFileRoot.instantiate('file-1', {
        ...defaultCreateProps,
        title: null,
        deleteAt: null,
        deleteBy: null,
        createdAt: now,
        updatedAt: now,
      });
      expect(f1.equals(f2)).toBe(true);
    });

    it('should return false for different ids', () => {
      const now = new Date();
      const f1 = UploadedFileRoot.instantiate('file-1', {
        ...defaultCreateProps,
        title: null,
        deleteAt: null,
        deleteBy: null,
        createdAt: now,
        updatedAt: now,
      });
      const f2 = UploadedFileRoot.instantiate('file-2', {
        ...defaultCreateProps,
        title: null,
        deleteAt: null,
        deleteBy: null,
        createdAt: now,
        updatedAt: now,
      });
      expect(f1.equals(f2)).toBe(false);
    });
  });
});

import { UploadedFileMapper } from '@application/mappers/uploaded-file.mapper';
import { UploadedFileRoot } from '@core/aggregate-roots';
import { TargetType } from '@core/enums';

describe('UploadedFileMapper', () => {
  const mockRoot = UploadedFileRoot.instantiate('file-1', {
    url: 'http://example.com/file.png',
    publicId: 'public-1',
    size: 1024,
    format: 'png',
    title: 'test-file',
    targetType: TargetType.USER,
    targetId: 'user-1',
    targetField: 'avatar',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deleteAt: null,
    deleteBy: null,
  });

  it('should map root to DTO correctly', () => {
    const dto = UploadedFileMapper.toDto(mockRoot);

    expect(dto.id).toBe('file-1');
    expect(dto.url).toBe('http://example.com/file.png');
    expect(dto.publicId).toBe('public-1');
    expect(dto.size).toBe(1024);
    expect(dto.format).toBe('png');
    expect(dto.title).toBe('test-file');
    expect(dto.targetType).toBe(TargetType.USER);
    expect(dto.targetId).toBe('user-1');
    expect(dto.targetField).toBe('avatar');
  });

  it('should map list of roots to list of DTOs correctly', () => {
    const dtos = UploadedFileMapper.toListDto([mockRoot]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('file-1');
  });
});

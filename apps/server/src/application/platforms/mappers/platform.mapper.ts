import { PlatformDto } from '../dtos';
import { PlatformRoot } from '@/core/aggregate-roots';

export class PlatformMapper {
  static toDto(root: PlatformRoot): PlatformDto {
    return {
      id: root.id!,
      name: root.name,
      baseUrl: root.baseUrl,
      apiStatus: root.apiStatus,
      iconUrl: root.iconUrl,
    };
  }

  static toListDto(roots: PlatformRoot[]): PlatformDto[] {
    return roots.map((root) => this.toDto(root));
  }
}

import { PlatformDto } from '@/application/dtos';
import { PlatformRoot } from '@/core/aggregate-roots';

export class PlatformMapper {
  static toDto(root: PlatformRoot): PlatformDto {
    return {
      id: root.id!,
      name: root.name,
      baseUrl: root.baseUrl,
      apiStatus: root.apiStatus,
      icon: root.icon,
    };
  }

  static toListDto(roots: PlatformRoot[]): PlatformDto[] {
    return roots.map((root) => this.toDto(root));
  }
}

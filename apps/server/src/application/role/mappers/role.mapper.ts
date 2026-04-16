import { RoleDto } from '../dtos';
import { RoleRoot } from '@/core/aggregate-roots/role.aggregate';

export class RoleMapper {
  static toDto(root: RoleRoot): RoleDto {
    return {
      id: root.id!,
      title: root.title,
      permissions: root.permissions,
      isBlocked: root.isBlocked,
      createdAt: root.createdAt,
      updatedAt: root.updatedAt,
    };
  }

  static toListDto(roots: RoleRoot[]): RoleDto[] {
    return roots.map((root) => this.toDto(root));
  }
}

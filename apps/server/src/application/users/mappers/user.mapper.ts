import { UserDto } from '../dtos/user.dto';
import { UserType } from '@/core/enums';
import { UserRoot, EnterpriseUserRoot } from '@/core/aggregate-roots';

export class UserMapper {
  static toDto(root: UserRoot<any>): UserDto {
    const baseFields = {
      id: root.id!,
      email: root.email,
      phone: root.phone,
      fullName: root.fullName,
      roleId: root.roleId,
      isEmailVerified: root.isEmailVerified,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
    };

    const type = root.type;

    switch (type) {
      case UserType.ENTERPRISE:
        return {
          ...baseFields,
          type: UserType.ENTERPRISE,
          enterpriseId: (root as EnterpriseUserRoot).enterpriseId,
        };
      case UserType.ADMIN:
        return {
          ...baseFields,
          type: UserType.ADMIN,
        };
      case UserType.KOL:
        return {
          ...baseFields,
          type: UserType.KOL,
        };
      default:
        throw new Error(`Unknown user type: ${type}`);
    }
  }

  static toListDto(roots: UserRoot<any>[]): UserDto[] {
    return roots.map((root) => this.toDto(root));
  }
}

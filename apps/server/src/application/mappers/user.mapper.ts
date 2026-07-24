import { UserDto } from '@/application/dtos';
import { EnterpriseUserRoot, UserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';

import { InvalidUserTypeException } from '@/core/exceptions';

export class UserMapper {
  static toDto(root: UserRoot<any>): UserDto {
    const baseFields = {
      id: root.id,
      email: root.email,
      phone: root.phone.value,
      fullName: root.fullName,
      avatar: root.avatar || null,
      roleId: root.roleId,
      isEmailVerified: root.isEmailVerified,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
    };

    const type = root.type;

    switch (type) {
      case ERoleType.ENTERPRISE:
        return {
          ...baseFields,
          type: ERoleType.ENTERPRISE,
          enterpriseIds: (root as EnterpriseUserRoot).enterpriseIds,
        };
      case ERoleType.ADMIN:
        return {
          ...baseFields,
          type: ERoleType.ADMIN,
        };
      case ERoleType.KOL:
        return {
          ...baseFields,
          type: ERoleType.KOL,
        };
      default:
        throw new InvalidUserTypeException(`Unknown user type: ${type}`);
    }
  }

  static toListDto(roots: UserRoot<any>[]): UserDto[] {
    return roots.map((root) => this.toDto(root));
  }
}

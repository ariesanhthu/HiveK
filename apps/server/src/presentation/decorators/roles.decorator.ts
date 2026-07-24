import { ERoleType } from '@/core/enums';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ERoleType[]) => SetMetadata(ROLES_KEY, roles);

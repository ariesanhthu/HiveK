import { SetMetadata } from '@nestjs/common';
import { ERoleType } from '@/core/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ERoleType[]) => SetMetadata(ROLES_KEY, roles);

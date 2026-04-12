import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleModel } from '../schemas/role.schema';
import { UserType } from '@/core/enums/user-type.enum';

@Injectable()
export class RoleSeedService implements OnModuleInit {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(
    @InjectModel(RoleModel.name)
    private readonly roleModel: Model<RoleModel>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    const count = await this.roleModel.countDocuments();
    if (count > 0) {
      this.logger.log('Roles already seeded. Skipping...');
      return;
    }

    this.logger.log('Seeding default roles...');

    const defaultRoles = [
      // ADMIN ROLES
      {
        title: `${UserType.ADMIN}_SUPER`,
        permissions: ['*'],
        is_blocked: false,
      },
      {
        title: `${UserType.ADMIN}_MANAGER`,
        permissions: ['manage_users', 'manage_enterprises', 'view_reports'],
        is_blocked: false,
      },
      {
        title: `${UserType.ADMIN}_VIEWER`,
        permissions: ['view_all'],
        is_blocked: false,
      },

      // ENTERPRISE ROLES
      {
        title: `${UserType.ENTERPRISE}_OWNER`,
        permissions: ['enterprise_full_access', 'manage_team', 'manage_billing'],
        is_blocked: false,
      },
      {
        title: `${UserType.ENTERPRISE}_MANAGER`,
        permissions: ['manage_campaigns', 'view_analytics', 'manage_members'],
        is_blocked: false,
      },
      {
        title: `${UserType.ENTERPRISE}_MEMBER`,
        permissions: ['view_campaigns', 'view_analytics'],
        is_blocked: false,
      },

      // KOL ROLES
      {
        title: `${UserType.KOL}_PRO`,
        permissions: ['kol_full_access', 'advanced_analytics', 'premium_features'],
        is_blocked: false,
      },
      {
        title: `${UserType.KOL}_BASIC`,
        permissions: ['view_jobs', 'apply_jobs', 'basic_analytics'],
        is_blocked: false,
      },
      {
        title: `${UserType.KOL}_GUEST`,
        permissions: ['view_public_jobs'],
        is_blocked: false,
      },
    ];

    try {
      await this.roleModel.insertMany(defaultRoles);
      this.logger.log(`Successfully seeded ${defaultRoles.length} default roles.`);
    } catch (error) {
      this.logger.error('Failed to seed default roles:', error);
    }
  }
}

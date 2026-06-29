import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleModel } from '../schemas/role.schema';
import { ERoleType } from '@/core/enums';
import { UserModel } from '../schemas';
import { type IUserRepository, USER_REPOSITORY } from '@/core/interfaces/repositories';
import * as bcrypt from 'bcrypt';
import { AdminRoot } from '@/core/aggregate-roots';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { env } from '@/shared/utils';

@Injectable()
export class RoleSeedService implements OnModuleInit {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(
    @InjectModel(RoleModel.name)
    private readonly roleModel: Model<RoleModel>,
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async onModuleInit() {
    if (env('SEEDING', '1') === '0') {
      return;
    }
    await this.seedRoles();
    await this.seedUsers();
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
        title: `${ERoleType.ADMIN}`,
        permissions: ['*'],
        type: ERoleType.ADMIN,
      },
      {
        title: `${ERoleType.ENTERPRISE}`,
        permissions: ['*'],
        type: ERoleType.ENTERPRISE,
      },
      {
        title: `${ERoleType.KOL}`,
        permissions: ['*'],
        type: ERoleType.KOL,
      },
    ];

    try {
      await this.roleModel.insertMany(defaultRoles);
      this.logger.log(`Successfully seeded ${defaultRoles.length} default roles.`);
    } catch (error) {
      this.logger.error('Failed to seed default roles:', error);
    }
  }

  private async seedUsers() {
    const count = await this.userModel.countDocuments({
      email: env('ADMIN_EMAIL'),
    });
    if (count > 0) {
      this.logger.log('Users already seeded. Skipping...');
      return;
    }
    const roles = await this.roleModel.find();
    const adminRole = roles.find(r => r.type === ERoleType.ADMIN);
    if (!adminRole) {
      throw new Error('No admin role found in system');
    }

    let user;
    const passwordHash = await bcrypt.hash(env('ADMIN_PASSWORD'), 10);
    const commonProps = {
      email: env('ADMIN_EMAIL'),
      phone: PhoneNumberVO.create({ value: '+0900000000' }),
      passwordHash,
      fullName: 'SUPER ADMIN',
      avatar: null,
      type: ERoleType.ADMIN,
      roleId: adminRole.id,
      isEmailVerified: true,
    };

    user = AdminRoot.create(commonProps);
    await this.userRepository.save(user);
  }
}

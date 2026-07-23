import {
  AUTH_JWT_SERVICE,
  type IAuthJwtService,
} from '@/application/interfaces/auth-jwt.interface';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../../src/infrastructure/modules/app.module';

describe('Role Domain (e2e)', () => {
  let app: INestApplication;
  let roleModel: Model<any>;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let adminToken: string;
  let kolToken: string;
  const testRoleId = '64f7b2c9e8b3c9001f3e4e90';
  const API_KEY = process.env.API_KEY || 'HiveK_ApiKey';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    const adminId = '64f7b2c9e8b3c9001f3e4e99';
    const kolId = '64f7b2c9e8b3c9001f3e4e98';
    adminToken = jwtService.sign({
      sub: adminId,
      email: 'admin-e2e@hivek.com',
      role: 'admin',
    });
    kolToken = jwtService.sign({
      sub: kolId,
      email: 'user-e2e@hivek.com',
      role: 'kol',
    });

    roleModel = app.get<Model<any>>(getModelToken('RoleModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Seed users for guard validation
    await userModel.deleteMany({
      _id: { $in: [new Types.ObjectId(adminId), new Types.ObjectId(kolId)] },
    });
    await userModel.collection.insertMany([
      {
        _id: new Types.ObjectId(adminId),
        email: 'admin-e2e@hivek.com',
        full_name: 'Admin E2E',
        phone: '+84999999999',
        password_hash: 'password123',
        type: 'admin',
        role_id: new Types.ObjectId().toString(),
        is_email_verified: true,
        enterprise_ids: [],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        _id: new Types.ObjectId(kolId),
        email: 'user-e2e@hivek.com',
        full_name: 'User E2E',
        phone: '+84123456788',
        password_hash: 'password123',
        type: 'kol',
        role_id: new Types.ObjectId().toString(),
        is_email_verified: true,
        enterprise_ids: [],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Clean up and seed test role
    await roleModel.deleteMany({ _id: new Types.ObjectId(testRoleId) });
    await roleModel.create({
      _id: new Types.ObjectId(testRoleId),
      title: 'E2E Test Role',
      permissions: ['read_campaigns'],
      type: 'kol',
    });
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: 'admin-e2e@hivek.com' });
    await roleModel.deleteMany({ _id: new Types.ObjectId(testRoleId) });
    await roleModel.deleteMany({ title: 'New E2E Admin Role' });
    await app.close();
  });

  it('should block non-admin requests', async () => {
    const res = await request(app.getHttpServer())
      .get(`/hivek/admin/v1/roles/${testRoleId}`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${kolToken}`)
      .expect(403);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should manage role lifecycle under admin privileges', async () => {
    // 1. Get by ID
    const getRes = await request(app.getHttpServer())
      .get(`/hivek/admin/v1/roles/${testRoleId}`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.title).toBe('E2E Test Role');

    // 2. Create Role
    const createRes = await request(app.getHttpServer())
      .post('/hivek/admin/v1/roles')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'New E2E Admin Role',
        permissions: ['*'],
        type: 'admin',
      })
      .expect(201);

    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.id).toBeDefined();
    const newRoleId = createRes.body.data.id;

    // 3. Update Role
    const updateRes = await request(app.getHttpServer())
      .patch(`/hivek/admin/v1/roles/${newRoleId}`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        permissions: ['read', 'write'],
      })
      .expect(200);

    expect(updateRes.body.success).toBe(true);

    // 4. Get List
    const listRes = await request(app.getHttpServer())
      .get('/hivek/admin/v1/roles')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ title: 'New E2E Admin Role' })
      .expect(200);

    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data[0].permissions).toContain('read');

    // 5. Soft delete
    await request(app.getHttpServer())
      .patch(`/hivek/admin/v1/roles/${testRoleId}/soft-delete`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ deletedBy: 'E2E-Admin' })
      .expect(204);

    // 6. Restore
    await request(app.getHttpServer())
      .patch(`/hivek/admin/v1/roles/${testRoleId}/restore`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // 7. Hard delete
    await request(app.getHttpServer())
      .delete(`/hivek/admin/v1/roles/${testRoleId}`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // Clean up created role
    await roleModel.deleteMany({ _id: new Types.ObjectId(newRoleId) });
  });
});

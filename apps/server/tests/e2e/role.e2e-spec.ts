import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';

describe('Role Domain (e2e)', () => {
  let app: INestApplication;
  let roleModel: Model<any>;
  let jwtService: IAuthJwtService;
  let adminToken: string;
  let kolToken: string;
  const testRoleId = '64f7b2c9e8b3c9001f3e4e90';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    adminToken = jwtService.sign({
      sub: '64f7b2c9e8b3c9001f3e4e99',
      email: 'admin-e2e@hivek.com',
      role: 'admin',
    });
    kolToken = jwtService.sign({
      sub: '64f7b2c9e8b3c9001f3e4e98',
      email: 'user-e2e@hivek.com',
      role: 'kol',
    });

    roleModel = app.get<Model<any>>(getModelToken('RoleModel'));

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
    await roleModel.deleteMany({ _id: new Types.ObjectId(testRoleId) });
    await roleModel.deleteMany({ title: 'New E2E Admin Role' });
    await app.close();
  });

  it('should block non-admin requests', async () => {
    await request(app.getHttpServer())
      .get(`/roles/${testRoleId}`)
      .set('Authorization', `Bearer ${kolToken}`)
      .expect(403);
  });

  it('should manage role lifecycle under admin privileges', async () => {
    // 1. Get by ID
    const getRes = await request(app.getHttpServer())
      .get(`/roles/${testRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(getRes.body.title).toBe('E2E Test Role');

    // 2. Create Role
    const createRes = await request(app.getHttpServer())
      .post('/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'New E2E Admin Role',
        permissions: ['*'],
        type: 'admin',
      })
      .expect(201);

    expect(createRes.body.id).toBeDefined();
    const newRoleId = createRes.body.id;

    // 3. Update Role
    await request(app.getHttpServer())
      .patch(`/roles/${newRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        permissions: ['read', 'write'],
      })
      .expect(200);

    // 4. Get List
    const listRes = await request(app.getHttpServer())
      .get('/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ title: 'New E2E Admin Role' })
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data[0].permissions).toContain('read');

    // 5. Soft delete
    await request(app.getHttpServer())
      .patch(`/roles/${testRoleId}/soft-delete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ deletedBy: 'E2E-Admin' })
      .expect(204);

    // 6. Restore
    await request(app.getHttpServer())
      .patch(`/roles/${testRoleId}/restore`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // 7. Hard delete
    await request(app.getHttpServer())
      .delete(`/roles/${testRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // Clean up created role
    await roleModel.deleteMany({ _id: new Types.ObjectId(newRoleId) });
  });
});

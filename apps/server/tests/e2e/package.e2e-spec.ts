import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../../src/infrastructure/modules/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('Package Domain (e2e)', () => {
  let app: INestApplication;
  let packageModel: Model<any>;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let adminToken: string;
  let userToken: string;
  const adminId = '64f7b2c9e8b3c9001f3e4ea0';
  const userId = '64f7b2c9e8b3c9001f3e4ea1';
  const API_KEY = process.env.API_KEY || 'HiveK_ApiKey';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    adminToken = jwtService.sign({
      sub: adminId,
      email: 'admin-pkg-e2e@hivek.com',
      role: 'admin',
    });
    userToken = jwtService.sign({
      sub: userId,
      email: 'user-pkg-e2e@hivek.com',
      role: 'enterprise',
    });

    packageModel = app.get<Model<any>>(getModelToken('PackageModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Seed admin & non-admin users
    await userModel.deleteMany({
      _id: { $in: [new Types.ObjectId(adminId), new Types.ObjectId(userId)] },
    });
    const commonUserProps = {
      phone: '+84123456700',
      password_hash: 'password123',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      enterprise_ids: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
    await userModel.collection.insertMany([
      {
        ...commonUserProps,
        _id: new Types.ObjectId(adminId),
        email: 'admin-pkg-e2e@hivek.com',
        full_name: 'Admin Package E2E',
        type: 'admin',
      },
      {
        ...commonUserProps,
        _id: new Types.ObjectId(userId),
        email: 'user-pkg-e2e@hivek.com',
        full_name: 'User Package E2E',
        type: 'enterprise',
      },
    ]);

    // Clean up E2E packages
    await packageModel.deleteMany({ code: { $regex: /^e2e-/ } });
  });

  afterAll(async () => {
    await packageModel.deleteMany({ code: { $regex: /^e2e-/ } });
    await userModel.deleteMany({
      _id: { $in: [new Types.ObjectId(adminId), new Types.ObjectId(userId)] },
    });
    await app.close();
  });

  describe('Lifecycle', () => {
    let packageId: string;
    const uniqueCode = `e2e-test-${Date.now()}`;

    it('should create a package in DRAFT', async () => {
      const res = await request(app.getHttpServer())
        .post('/hivek/admin/v1/packages')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: uniqueCode,
          name: 'E2E Test Package',
          description: 'E2E Package Description',
          type: 'plan',
          scope: 'public',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe(uniqueCode);
      expect(res.body.data.status).toBe('draft');
      packageId = res.body.data.id;
    });

    it('should get package by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/hivek/admin/v1/packages/${packageId}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe(uniqueCode);
      expect(res.body.data.status).toBe('draft');
    });

    it('should list packages', async () => {
      const res = await request(app.getHttpServer())
        .get('/hivek/admin/v1/packages')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ code: uniqueCode })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].code).toBe(uniqueCode);
    });

    it('should update package metadata', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/hivek/admin/v1/packages/${packageId}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Updated Package',
          description: 'E2E Updated Description',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('E2E Updated Package');
    });

    it('should publish package (DRAFT → ACTIVE)', async () => {
      // Need to add a variant first (required by publish validation)
      await request(app.getHttpServer())
        .patch(`/hivek/admin/v1/packages/${packageId}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newVariants: [
            {
              title: 'Monthly',
              durationMonths: 1,
              price: 100000,
              priceAfterDiscount: 90000,
              tax: 10000,
              currency: 'vnd',
              extraGrants: [],
            },
          ],
        })
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/hivek/admin/v1/packages/${packageId}/status`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('active');
    });

    it('should archive package (ACTIVE → ARCHIVED)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/hivek/admin/v1/packages/${packageId}/status`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'archived' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('archived');
    });

    it('should delete an archived package', async () => {
      await request(app.getHttpServer())
        .delete(`/hivek/admin/v1/packages/${packageId}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify deletion
      const getRes = await request(app.getHttpServer())
        .get(`/hivek/admin/v1/packages/${packageId}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data).toBeNull();
    });
  });

  describe('Error cases', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/hivek/admin/v1/packages')
        .expect(401);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/hivek/admin/v1/packages')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return null data when getting non-existent package', async () => {
      const res = await request(app.getHttpServer())
        .get('/hivek/admin/v1/packages/64f7b2c9e8b3c9001f3e4fff')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });
  });
});

import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../../src/infrastructure/modules/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('Platform Domain (e2e)', () => {
  let app: INestApplication;
  let platformModel: Model<any>;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let authToken: string;
  const testAdminId = '64f7b2c9e8b3c9001f3e4e94';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    authToken = jwtService.sign({
      sub: testAdminId,
      email: 'platform-tester@hivek.com',
      role: 'admin',
    });

    platformModel = app.get<Model<any>>(getModelToken('PlatformModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Seed admin user
    await userModel.deleteMany({ _id: new Types.ObjectId(testAdminId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(testAdminId),
      email: 'platform-tester@hivek.com',
      full_name: 'Platform Tester',
      phone: '+84123456784',
      password_hash: 'password123',
      type: 'admin',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Clean up E2E platform documents
    await platformModel.deleteMany({ name: { $regex: /^E2E /i } });
  });

  afterAll(async () => {
    await platformModel.deleteMany({ name: { $regex: /^E2E /i } });
    await userModel.deleteMany({ _id: new Types.ObjectId(testAdminId) });
    await app.close();
  });

  it('should manage platform lifecycle', async () => {
    // 1. Create Platform
    const createRes = await request(app.getHttpServer())
      .post('/hivek/api/platforms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'E2E Platform',
        baseUrl: 'https://e2e-platform.com',
        apiStatus: 'stable',
      })
      .expect(201);

    expect(createRes.body.name.toLowerCase()).toBe('e2e platform');
    const platformId = createRes.body.id;

    // 2. Get Platform by ID
    const getRes = await request(app.getHttpServer())
      .get(`/hivek/api/platforms/${platformId}`)
      .expect(200);

    expect(getRes.body.name.toLowerCase()).toBe('e2e platform');

    // 3. Find All Platforms
    const listRes = await request(app.getHttpServer())
      .get('/hivek/api/platforms')
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Update Platform
    const updateRes = await request(app.getHttpServer())
      .patch(`/hivek/api/platforms/${platformId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'E2E Platform Updated',
        apiStatus: 'maintenance',
      })
      .expect(200);

    expect(updateRes.body.name.toLowerCase()).toBe('e2e platform updated');
    expect(updateRes.body.apiStatus).toBe('maintenance');

    // 5. Soft Delete
    await request(app.getHttpServer())
      .patch(`/hivek/api/platforms/${platformId}/soft-delete`)
      .set('Authorization', `Bearer ${authToken}`)
      .query({ deletedBy: 'E2E-Tester' })
      .expect(204);

    // 6. Restore
    await request(app.getHttpServer())
      .patch(`/hivek/api/platforms/${platformId}/restore`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 7. Hard Delete
    await request(app.getHttpServer())
      .delete(`/hivek/api/platforms/${platformId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // 8. Verify Gone
    await request(app.getHttpServer())
      .get(`/hivek/api/platforms/${platformId}`)
      .expect(404);
  });
});

import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../../src/infrastructure/modules/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('KOL Profile Domain (e2e)', () => {
  let app: INestApplication;
  let kolProfileModel: Model<any>;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let authToken: string;
  const testProfileId = '64f7b2c9e8b3c9001f3e4e93';
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
      email: 'kol-tester@hivek.com',
      role: 'admin',
    });

    kolProfileModel = app.get<Model<any>>(getModelToken('KolProfileModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Seed user
    await userModel.deleteMany({ _id: new Types.ObjectId(testAdminId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(testAdminId),
      email: 'kol-tester@hivek.com',
      full_name: 'Admin Tester',
      phone: '+84123456780',
      password_hash: 'password123',
      type: 'admin',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Clean up and seed test influencer profile
    await kolProfileModel.deleteMany({ _id: new Types.ObjectId(testProfileId) });
    await kolProfileModel.create({
      _id: new Types.ObjectId(testProfileId),
      name: 'E2E KOL Influencer',
      email: 'kol-e2e@hivek.com',
      location: 'VN',
      gender: 'female',
      bio: 'Influencer Bio E2E',
      phone: '+84123456789',
      is_verified: false,
    });
  });

  afterAll(async () => {
    await kolProfileModel.deleteMany({ _id: new Types.ObjectId(testProfileId) });
    await userModel.deleteMany({ _id: new Types.ObjectId(testAdminId) });
    await app.close();
  });

  it('should manage KOL profile lifecycle', async () => {
    // 1. Get by ID
    const getRes = await request(app.getHttpServer())
      .get(`/hivek/api/kol-profiles/${testProfileId}`)
      .expect(200);

    expect(getRes.body.name).toBe('E2E KOL Influencer');
    expect(getRes.body.email).toBe('kol-e2e@hivek.com');

    // 2. Search/List profiles
    const listRes = await request(app.getHttpServer())
      .get('/hivek/api/kol-profiles')
      .query({ name: 'E2E KOL' })
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 3. Update KOL Profile
    const updateRes = await request(app.getHttpServer())
      .patch(`/hivek/api/kol-profiles/${testProfileId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'E2E KOL Influencer Updated',
        bio: 'Updated Bio E2E',
      })
      .expect(200);

    expect(updateRes.body.name).toBe('E2E KOL Influencer Updated');
    expect(updateRes.body.bio).toBe('Updated Bio E2E');

    // 4. Soft Delete
    await request(app.getHttpServer())
      .patch(`/hivek/api/kol-profiles/${testProfileId}/soft-delete`)
      .set('Authorization', `Bearer ${authToken}`)
      .query({ deletedBy: 'E2E-Tester' })
      .expect(204);

    // 5. Restore
    await request(app.getHttpServer())
      .patch(`/hivek/api/kol-profiles/${testProfileId}/restore`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 6. Hard Delete
    await request(app.getHttpServer())
      .delete(`/hivek/api/kol-profiles/${testProfileId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // 7. Verify Gone
    await request(app.getHttpServer())
      .get(`/hivek/api/kol-profiles/${testProfileId}`)
      .expect(404);
  });
});

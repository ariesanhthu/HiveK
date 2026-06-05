import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';

describe('User Domain (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let adminToken: string;
  let kolToken: string;
  const testUserId = '64f7b2c9e8b3c9001f3e4e91';

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
      sub: testUserId,
      email: 'user-e2e@hivek.com',
      role: 'kol',
    });

    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Clean up and seed test user via direct MongoDB collection write
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(testUserId),
      email: 'user-e2e@hivek.com',
      full_name: 'User E2E',
      phone: '0000000000',
      password_hash: 'password123',
      type: 'kol',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  afterAll(async () => {
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    await userModel.deleteMany({ email: 'new-admin-e2e@hivek.com' });
    await app.close();
  });

  it('should block non-admin requests', async () => {
    await request(app.getHttpServer())
      .get(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${kolToken}`)
      .expect(403);
  });

  it('should manage user lifecycle under admin privileges', async () => {
    // 1. Get by ID
    const getRes = await request(app.getHttpServer())
      .get(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(getRes.body.email).toBe('user-e2e@hivek.com');

    // 2. Create User
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'new-admin-e2e@hivek.com',
        phone: '0901234567',
        password: 'SecurePassword123!',
        fullName: 'New Admin E2E',
        type: 'admin',
        roleId: new Types.ObjectId().toString(),
      })
      .expect(201);

    expect(createRes.body.id).toBeDefined();
    const newUserId = createRes.body.id;

    // 3. Update User
    await request(app.getHttpServer())
      .patch(`/users/${newUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Updated Admin E2E',
      })
      .expect(200);

    // 4. Get List
    const listRes = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ email: 'new-admin-e2e' })
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data[0].fullName).toBe('Updated Admin E2E');

    // 5. Soft delete
    await request(app.getHttpServer())
      .patch(`/users/${testUserId}/soft-delete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ deletedBy: 'E2E-Admin' })
      .expect(204);

    // 6. Restore
    await request(app.getHttpServer())
      .patch(`/users/${testUserId}/restore`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // 7. Hard delete
    await request(app.getHttpServer())
      .delete(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // 8. Get by ID - should return 404 (since query handler throws UserNotFoundException)
    await request(app.getHttpServer())
      .get(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    // Clean up new user
    await userModel.deleteMany({ _id: new Types.ObjectId(newUserId) });
  });
});

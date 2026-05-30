import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './../../src/app.module';

describe('User Domain (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<any>;
  const testUserId = '64f7b2c9e8b3c9001f3e4e91';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Clean up and seed test user via direct MongoDB collection write
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(testUserId),
      email: 'user-e2e@hivek.com',
      full_name: 'User E2E',
      phone: '0000000000',
      password_hash: 'password123',
      type: 'KOL',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  afterAll(async () => {
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    await app.close();
  });

  it('should manage user lifecycle: retrieve, soft-delete, restore, and delete', async () => {
    // 1. Get by ID
    const getRes = await request(app.getHttpServer())
      .get(`/users/${testUserId}`)
      .expect(200);

    expect(getRes.body.email).toBe('user-e2e@hivek.com');

    // 2. Soft delete
    await request(app.getHttpServer())
      .patch(`/users/${testUserId}/soft-delete`)
      .query({ deletedBy: 'E2E-Admin' })
      .expect(204);

    // 3. Restore
    await request(app.getHttpServer())
      .patch(`/users/${testUserId}/restore`)
      .expect(200);

    // 4. Hard delete
    await request(app.getHttpServer())
      .delete(`/users/${testUserId}`)
      .expect(204);

    // 5. Get by ID - should return 500 (since query handler throws generic Error)
    await request(app.getHttpServer())
      .get(`/users/${testUserId}`)
      .expect(500);
  });
});

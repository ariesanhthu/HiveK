import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../../src/infrastructure/modules/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('Enterprise Domain (e2e)', () => {
  let app: INestApplication;
  let enterpriseModel: Model<any>;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let authToken: string;
  const testUserId = '64f7b2c9e8b3c9001f3e4e92';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    authToken = jwtService.sign({
      sub: testUserId,
      email: 'enterprise-owner-e2e@hivek.com',
      role: 'enterprise',
    });

    enterpriseModel = app.get<Model<any>>(getModelToken('EnterpriseModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Clean up and seed test enterprise owner
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    const commonUserProps = {
      phone: '+84123456789',
      password_hash: 'password123',
      type: 'enterprise',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      enterprise_ids: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
    await userModel.collection.insertOne({
      ...commonUserProps,
      _id: new Types.ObjectId(testUserId),
      email: 'enterprise-owner-e2e@hivek.com',
      full_name: 'Enterprise Owner E2E',
    });

    // Clean up E2E enterprise documents
    await enterpriseModel.deleteMany({ companyName: { $regex: /^E2E /i } });
  });

  afterAll(async () => {
    await enterpriseModel.deleteMany({ companyName: { $regex: /^E2E /i } });
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    await app.close();
  });

  it('should manage enterprise profile lifecycle', async () => {
    // 1. Create Enterprise Profile
    const createRes = await request(app.getHttpServer())
      .post('/hivek/api/enterprises')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyName: 'E2E Test Company',
        description: 'E2E Company Description',
        contactEmail: 'e2e@company.com',
        contactPhone: '+84987654321',
      })
      .expect(201);

    expect(createRes.body.companyName).toBe('E2E Test Company');
    const enterpriseId = createRes.body.id;

    // Verify creator was added to enterprise_ids
    const creator = await userModel.findById(testUserId);
    expect(creator.enterprise_ids.map((id: any) => id.toString())).toContain(enterpriseId);

    // 2. Update Enterprise Profile
    const updateRes = await request(app.getHttpServer())
      .patch(`/hivek/api/enterprises/${enterpriseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyName: 'E2E Test Company Updated',
      })
      .expect(200);

    expect(updateRes.body.companyName).toBe('E2E Test Company Updated');

    // 3. Get by ID
    const getRes = await request(app.getHttpServer())
      .get(`/hivek/api/enterprises/${enterpriseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getRes.body.companyName).toBe('E2E Test Company Updated');

    // 4. Get List
    const listRes = await request(app.getHttpServer())
      .get('/hivek/api/enterprises')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ companyName: 'E2E Test' })
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 5. Add Another User to Enterprise
    const secondUserId = '64f7b2c9e8b3c9001f3e4e93';
    await userModel.deleteMany({ _id: new Types.ObjectId(secondUserId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(secondUserId),
      email: 'second-user@hivek.com',
      full_name: 'Second User',
      phone: '+84111222333',
      password_hash: 'hash',
      type: 'enterprise',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      enterprise_ids: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    await request(app.getHttpServer())
      .post(`/hivek/api/enterprises/${enterpriseId}/users/${secondUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const otherUser = await userModel.findById(secondUserId);
    expect(otherUser.enterprise_ids.map((id: any) => id.toString())).toContain(enterpriseId);

    // 6. Revoke User from Enterprise
    await request(app.getHttpServer())
      .delete(`/hivek/api/enterprises/${enterpriseId}/users/${secondUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    const revokedUser = await userModel.findById(secondUserId);
    expect(revokedUser.enterprise_ids.map((id: any) => id.toString())).not.toContain(enterpriseId);

    // Clean up
    await userModel.deleteMany({ _id: new Types.ObjectId(secondUserId) });
  });
});

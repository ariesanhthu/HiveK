import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('Campaign Domain (e2e)', () => {
  let app: INestApplication;
  let campaignModel: Model<any>;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let authToken: string;
  const testUserId = '64f7b2c9e8b3c9001f3e4e94';

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
      email: 'campaign-tester@hivek.com',
      role: 'enterprise',
    });

    campaignModel = app.get<Model<any>>(getModelToken('CampaignModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Seed enterprise user for JWT validation
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(testUserId),
      email: 'campaign-tester@hivek.com',
      full_name: 'Campaign Tester',
      phone: '+84123456781',
      password_hash: 'password123',
      type: 'enterprise',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      enterprise_ids: [new Types.ObjectId('64f7b2c9e8b3c9001f3e4e95')],
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Clean up E2E campaigns
    await campaignModel.deleteMany({ description: { $regex: /^E2E / } });
  });

  afterAll(async () => {
    await campaignModel.deleteMany({ description: { $regex: /^E2E / } });
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    await app.close();
  });

  it('should manage campaign lifecycle', async () => {
    const campaignPayload = {
      ownerId: testUserId,
      enterpriseId: '64f7b2c9e8b3c9001f3e4e95',
      budget: 5000,
      financialTarget: { target: 'sales' },
      description: 'E2E Campaign Test Description',
      platformTarget: [
        {
          platformId: 'instagram',
          minFollowers: 100,
          maxFollowers: 500,
          note: 'test note',
          others: { age: '18-24' },
        },
      ],
    };

    // 1. Create Campaign
    const createRes = await request(app.getHttpServer())
      .post('/hivek/api/campaigns')
      .set('Authorization', `Bearer ${authToken}`)
      .send(campaignPayload)
      .expect(201);

    expect(createRes.body.description).toBe('E2E Campaign Test Description');
    const campaignId = createRes.body.id;

    // 2. Get Campaign by ID
    const getRes = await request(app.getHttpServer())
      .get(`/hivek/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getRes.body.description).toBe('E2E Campaign Test Description');

    // 3. Get All Campaigns
    const listRes = await request(app.getHttpServer())
      .get('/hivek/api/campaigns')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Update Campaign
    const updateRes = await request(app.getHttpServer())
      .patch(`/hivek/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'E2E Campaign Test Updated Description',
        budget: 6000,
      })
      .expect(200);

    expect(updateRes.body.description).toBe('E2E Campaign Test Updated Description');
    expect(updateRes.body.budget).toBe(6000);

    // 5. Soft Delete
    await request(app.getHttpServer())
      .patch(`/hivek/api/campaigns/${campaignId}/soft-delete`)
      .set('Authorization', `Bearer ${authToken}`)
      .query({ deletedBy: 'E2E-Tester' })
      .expect(204);

    // 6. Restore
    await request(app.getHttpServer())
      .patch(`/hivek/api/campaigns/${campaignId}/restore`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('should return 401 without auth token', async () => {
    await request(app.getHttpServer())
      .get('/hivek/api/campaigns')
      .expect(401);
  });

  it('should return 404 when getting non-existent campaign', async () => {
    await request(app.getHttpServer())
      .get('/hivek/api/campaigns/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('should return 404 when updating non-existent campaign', async () => {
    await request(app.getHttpServer())
      .patch('/hivek/api/campaigns/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Ghost' })
      .expect(404);
  });
});

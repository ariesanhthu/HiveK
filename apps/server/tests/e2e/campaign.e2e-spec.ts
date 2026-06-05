import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';

describe('Campaign Domain (e2e)', () => {
  let app: INestApplication;
  let campaignModel: Model<any>;
  let jwtService: IAuthJwtService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    authToken = jwtService.sign({
      sub: '64f7b2c9e8b3c9001f3e4e94',
      email: 'campaign-tester@hivek.com',
      role: 'enterprise',
    });

    campaignModel = app.get<Model<any>>(getModelToken('CampaignModel'));

    // Clean up E2E campaigns
    await campaignModel.deleteMany({ description: { $regex: /^E2E / } });
  });

  afterAll(async () => {
    await campaignModel.deleteMany({ description: { $regex: /^E2E / } });
    await app.close();
  });

  it('should manage campaign lifecycle', async () => {
    const campaignPayload = {
      ownerId: '64f7b2c9e8b3c9001f3e4e94',
      enterpriseId: '64f7b2c9e8b3c9001f3e4e95',
      budget: 5000,
      financialTarget: { target: 'sales' },
      description: 'E2E Campaign Test Description',
      platformTarget: [
        {
          platformId: 'instagram',
          min: 100,
          max: 500,
          others: { age: '18-24' },
        },
      ],
    };

    // 1. Create Campaign
    const createRes = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${authToken}`)
      .send(campaignPayload)
      .expect(201);

    expect(createRes.body.description).toBe('E2E Campaign Test Description');
    const campaignId = createRes.body.id;

    // 2. Get Campaign by ID
    const getRes = await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getRes.body.description).toBe('E2E Campaign Test Description');

    // 3. Get All Campaigns
    const listRes = await request(app.getHttpServer())
      .get('/campaigns')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Update Campaign
    const updateRes = await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}`)
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
      .patch(`/campaigns/${campaignId}/soft-delete`)
      .set('Authorization', `Bearer ${authToken}`)
      .query({ deletedBy: 'E2E-Tester' })
      .expect(204);

    // 6. Restore
    await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}/restore`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 7. Hard Delete
    await request(app.getHttpServer())
      .delete(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // 8. Verify Gone
    await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('should return 401 without auth token', async () => {
    await request(app.getHttpServer())
      .get('/campaigns')
      .expect(401);
  });

  it('should return 404 when getting non-existent campaign', async () => {
    await request(app.getHttpServer())
      .get('/campaigns/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('should return 404 when updating non-existent campaign', async () => {
    await request(app.getHttpServer())
      .patch('/campaigns/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Ghost' })
      .expect(404);
  });
});
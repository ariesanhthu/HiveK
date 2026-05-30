import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './../../src/app.module';

describe('Campaign Domain (e2e)', () => {
  let app: INestApplication;
  let campaignModel: Model<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    campaignModel = app.get<Model<any>>(getModelToken('CampaignModel'));

    // Clean up E2E campaigns
    await campaignModel.deleteMany({ 'campaign.name': { $regex: /^E2E / } });
  });

  afterAll(async () => {
    await campaignModel.deleteMany({ 'campaign.name': { $regex: /^E2E / } });
    await app.close();
  });

  it('should manage campaign lifecycle', async () => {
    const campaignPayload = {
      ownerId: '64f7b2c9e8b3c9001f3e4e94',
      enterpriseId: '64f7b2c9e8b3c9001f3e4e95',
      campaign: {
        name: 'E2E Campaign Test',
        type: 'promotion',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        objective: 'Test Campaign',
        description: 'Test Campaign Description',
      },
      targeting: {
        audience: {
          ageRange: '18-25',
          interests: ['beauty', 'fashion'],
        },
        locations: ['HCM', 'HN'],
      },
      campaignItems: [
        {
          product: {
            name: 'Lipstick E2E',
            category: 'Beauty',
            brand: 'E2E Brand',
            description: 'Red Lipstick',
            features: ['matte', 'long-lasting'],
            keywords: ['lipstick', 'beauty'],
            priceSegment: 'mid',
          },
          marketing: {
            angle: ['romantic'],
            contentStyle: ['video'],
            tone: ['friendly'],
            keyMessages: ['Be beautiful'],
          },
          pricing: {
            originalPrice: 200000,
            salePrice: 150000,
            currency: 'VND',
          },
          promotion: {
            type: 'discount',
            value: 25,
            unit: 'percent',
          },
          channels: [
            {
              type: 'social',
              platform: 'tiktok',
              url: 'https://tiktok.com',
            },
          ],
        },
      ],
    };

    // 1. Create Campaign
    const createRes = await request(app.getHttpServer())
      .post('/campaigns')
      .send(campaignPayload)
      .expect(201);

    expect(createRes.body.campaign.name).toBe('E2E Campaign Test');
    const campaignId = createRes.body.id;

    // 2. Get Campaign by ID
    const getRes = await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .expect(200);

    expect(getRes.body.campaign.name).toBe('E2E Campaign Test');

    // 3. Get All Campaigns
    const listRes = await request(app.getHttpServer())
      .get('/campaigns')
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Update Campaign
    const updateRes = await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}`)
      .send({
        campaign: {
          name: 'E2E Campaign Test Updated',
          type: 'launch',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          objective: 'Updated Objective',
          description: 'Updated Description',
        },
      })
      .expect(200);

    expect(updateRes.body.campaign.name).toBe('E2E Campaign Test Updated');

    // 5. Soft Delete
    await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}/soft-delete`)
      .query({ deletedBy: 'E2E-Tester' })
      .expect(204);

    // 6. Restore
    await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}/restore`)
      .expect(200);

    // 7. Hard Delete
    await request(app.getHttpServer())
      .delete(`/campaigns/${campaignId}`)
      .expect(204);

    // 8. Verify Gone
    await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .expect(404);
  });
});

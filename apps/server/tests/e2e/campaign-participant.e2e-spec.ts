import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';

describe('Campaign Participant Domain (e2e)', () => {
  let app: INestApplication;
  let participantModel: Model<any>;
  let jwtService: IAuthJwtService;
  let authToken: string;

  const mockCampaignId = new Types.ObjectId().toString();
  const mockKolProfileId = new Types.ObjectId().toString();
  const mockPlatformId = new Types.ObjectId().toString();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    authToken = jwtService.sign({
      sub: '64f7b2c9e8b3c9001f3e4e94',
      email: 'admin-tester@hivek.com',
      role: 'admin',
    });

    participantModel = app.get<Model<any>>(getModelToken('CampaignParticipantModel'));

    // Clean up E2E participant documents
    await participantModel.deleteMany({ campaign_id: new Types.ObjectId(mockCampaignId) as any });
  });

  afterAll(async () => {
    await participantModel.deleteMany({ campaign_id: new Types.ObjectId(mockCampaignId) as any });
    await app.close();
  });

  it('should manage campaign participant lifecycle through controller endpoints', async () => {
    // 1. Create Participant (POST /campaign-participants)
    const createRes = await request(app.getHttpServer())
      .post('/campaign-participants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        campaignId: mockCampaignId,
        kolProfileId: mockKolProfileId,
      })
      .expect(201);

    const participantId = createRes.text;
    expect(participantId).toBeDefined();
    expect(typeof participantId).toBe('string');

    // 2. Get Participant by ID (GET /campaign-participants/:id)
    const getRes = await request(app.getHttpServer())
      .get(`/campaign-participants/${participantId}`)
      .expect(200);

    expect(getRes.body.campaignId).toBe(mockCampaignId);
    expect(getRes.body.kolProfileId).toBe(mockKolProfileId);
    expect(getRes.body.status).toBe('pending_approval');

    // 3. Find All/Get List (GET /campaign-participants)
    const listRes = await request(app.getHttpServer())
      .get('/campaign-participants')
      .query({ campaignId: mockCampaignId })
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Update Participant (PATCH /campaign-participants/:id) - Join Campaign
    await request(app.getHttpServer())
      .patch(`/campaign-participants/${participantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'JOINED',
      })
      .expect(200);

    // 5. Update outputs (PATCH /campaign-participants/:id) - Add a scheduled output
    await request(app.getHttpServer())
      .patch(`/campaign-participants/${participantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        outputs: [
          {
            platformId: mockPlatformId,
            outputType: 'SHORT_VIDEO',
            title: 'E2E Scheduled post',
            isScheduleForPost: true,
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
      })
      .expect(200);

    // 6. Fail to update outputs if url is missing when direct publishing (isScheduleForPost: false)
    await request(app.getHttpServer())
      .patch(`/campaign-participants/${participantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        outputs: [
          {
            platformId: mockPlatformId,
            outputType: 'VIDEO',
            title: 'Direct Published missing url',
            isScheduleForPost: false,
          },
        ],
      })
      .expect(400);

    // 7. Soft Delete (PATCH /campaign-participants/:id/soft-delete)
    await request(app.getHttpServer())
      .patch(`/campaign-participants/${participantId}/soft-delete`)
      .set('Authorization', `Bearer ${authToken}`)
      .query({ deletedBy: 'E2E-Tester' })
      .expect(204);

    // 8. Restore (PATCH /campaign-participants/:id/restore)
    await request(app.getHttpServer())
      .patch(`/campaign-participants/${participantId}/restore`)
      .expect(200);

    // 9. Hard Delete (DELETE /campaign-participants/:id)
    await request(app.getHttpServer())
      .delete(`/campaign-participants/${participantId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // 10. Verify Gone (GET /campaign-participants/:id -> returns 404)
    await request(app.getHttpServer())
      .get(`/campaign-participants/${participantId}`)
      .expect(404);
  });
});

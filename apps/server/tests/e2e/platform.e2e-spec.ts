import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './../../src/app.module';

describe('Platform Domain (e2e)', () => {
  let app: INestApplication;
  let platformModel: Model<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    platformModel = app.get<Model<any>>(getModelToken('PlatformModel'));

    // Clean up E2E platform documents
    await platformModel.deleteMany({ name: { $regex: /^e2e / } });
  });

  afterAll(async () => {
    await platformModel.deleteMany({ name: { $regex: /^e2e / } });
    await app.close();
  });

  it('should manage platform lifecycle', async () => {
    // 1. Create Platform
    const createRes = await request(app.getHttpServer())
      .post('/platforms')
      .send({
        name: 'E2E Platform',
        baseUrl: 'https://e2e-platform.com',
        apiStatus: 'stable',
      })
      .expect(201);

    expect(createRes.body.name).toBe('e2e platform');
    const platformId = createRes.body.id;

    // 2. Get Platform by ID
    const getRes = await request(app.getHttpServer())
      .get(`/platforms/${platformId}`)
      .expect(200);

    expect(getRes.body.name).toBe('e2e platform');

    // 3. Find All Platforms
    const listRes = await request(app.getHttpServer())
      .get('/platforms')
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Update Platform
    const updateRes = await request(app.getHttpServer())
      .patch(`/platforms/${platformId}`)
      .send({
        name: 'E2E Platform Updated',
        apiStatus: 'maintenance',
      })
      .expect(200);

    expect(updateRes.body.name).toBe('e2e platform updated');
    expect(updateRes.body.apiStatus).toBe('maintenance');

    // 5. Soft Delete
    await request(app.getHttpServer())
      .patch(`/platforms/${platformId}/soft-delete`)
      .query({ deletedBy: 'E2E-Tester' })
      .expect(204);

    // 6. Restore
    await request(app.getHttpServer())
      .patch(`/platforms/${platformId}/restore`)
      .expect(200);

    // 7. Hard Delete
    await request(app.getHttpServer())
      .delete(`/platforms/${platformId}`)
      .expect(204);

    // 8. Verify Gone
    await request(app.getHttpServer())
      .get(`/platforms/${platformId}`)
      .expect(404);
  });
});

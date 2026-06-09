import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('KPI Log Domain (e2e)', () => {
  let app: INestApplication;
  let kpiLogModel: Model<any>;
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
      email: 'kpi-tester@hivek.com',
      role: 'admin',
    });

    kpiLogModel = app.get<Model<any>>(getModelToken('KpiLogModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Seed user
    await userModel.deleteMany({ _id: new Types.ObjectId(testAdminId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(testAdminId),
      email: 'kpi-tester@hivek.com',
      full_name: 'KPI Tester',
      phone: '+84123456787',
      password_hash: 'password123',
      type: 'admin',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Clean up E2E KPI logs
    await kpiLogModel.deleteMany({ participantId: new Types.ObjectId('64f7b2c9e8b3c9001f3e4e96') });

    // Seed a timeseries KPI log
    await kpiLogModel.create({
      timestamp: new Date(),
      participantId: new Types.ObjectId('64f7b2c9e8b3c9001f3e4e96'),
      metrics: {
        views: 1000,
        likes: 500,
        comments: 200,
        shares: 50,
      },
    });
  });

  afterAll(async () => {
    await kpiLogModel.deleteMany({ participantId: new Types.ObjectId('64f7b2c9e8b3c9001f3e4e96') });
    await userModel.deleteMany({ _id: new Types.ObjectId(testAdminId) });
    await app.close();
  });

  it('should fetch paginated KPI logs', async () => {
    const res = await request(app.getHttpServer())
      .get('/hivek/api/analytics/kpi-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ participantId: '64f7b2c9e8b3c9001f3e4e96' })
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].metrics.views).toBe(1000);
  });
});

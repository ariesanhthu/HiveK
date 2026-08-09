import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../../src/infrastructure/modules/app.module';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('Authz - Workspace Session (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<any>;
  let enterpriseModel: Model<any>;
  const ownerEmail = 'e2e-authz-owner@hivek.com';
  const memberEmail = 'e2e-authz-member@hivek.com';
  const API_KEY = process.env.API_KEY || 'HiveK_ApiKey';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    userModel = app.get<Model<any>>(getModelToken('UserModel'));
    enterpriseModel = app.get<Model<any>>(getModelToken('EnterpriseModel'));

    // Clean up test data
    await userModel.deleteMany({ email: { $in: [ownerEmail, memberEmail] } });
    await enterpriseModel.deleteMany({ contactEmail: ownerEmail });
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: { $in: [ownerEmail, memberEmail] } });
    await enterpriseModel.deleteMany({ contactEmail: ownerEmail });
    await app.close();
  });

  describe('2-step login flow', () => {
    let ownerUserId: string;
    let ownerAccessToken: string;
    let ownerRefreshToken: string;
    let enterpriseId: string;

    beforeAll(async () => {
      // Create owner user
      const signUpRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/sign-up/enterprise')
        .set('x-api-key', API_KEY)
        .send({
          email: ownerEmail,
          password: 'SecurePassword123!',
          phone: '+84123456789',
          fullName: 'E2E Authz Owner',
        });

      ownerUserId = signUpRes.body.data.userId;

      // Create enterprise
      const signInRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/sign-in')
        .set('x-api-key', API_KEY)
        .send({
          email: ownerEmail,
          password: 'SecurePassword123!',
        });

      ownerAccessToken = signInRes.body.data.accessToken;
      ownerRefreshToken = signInRes.body.data.refreshToken;

      const enterpriseRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/enterprises')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .send({
          companyName: 'E2E Authz Enterprise',
          contactEmail: ownerEmail,
        });

      enterpriseId = enterpriseRes.body.data.id;
    });

    it('should return accessible enterprises on sign-in', async () => {
      const signInRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/sign-in')
        .set('x-api-key', API_KEY)
        .send({
          email: ownerEmail,
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(signInRes.body.success).toBe(true);
      const data = signInRes.body.data;
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.accessibleEnterprises).toBeDefined();
      expect(Array.isArray(data.accessibleEnterprises)).toBe(true);
      expect(data.accessibleEnterprises.length).toBeGreaterThan(0);
      expect(data.accessibleEnterprises[0].enterpriseId).toBe(enterpriseId);
      expect(data.accessibleEnterprises[0].role).toBe('owner');
    });

    it('should select workspace and return scoped token', async () => {
      // First sign in to get scope-less token
      const signInRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/sign-in')
        .set('x-api-key', API_KEY)
        .send({
          email: ownerEmail,
          password: 'SecurePassword123!',
        });

      const scopeLessToken = signInRes.body.data.accessToken;

      // Select workspace
      const selectRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/workspace/select')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${scopeLessToken}`)
        .send({ enterpriseId })
        .expect(200);

      expect(selectRes.body.success).toBe(true);
      const data = selectRes.body.data;
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();

      // Verify scoped token can access protected endpoints
      const profileRes = await request(app.getHttpServer())
        .get('/hivek/client/v1/auth/profile')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${data.accessToken}`)
        .expect(200);

      expect(profileRes.body.success).toBe(true);
    });

    it('should reject workspace selection for non-member', async () => {
      // Create another user who is not a member
      const otherEmail = 'e2e-authz-other@hivek.com';
      await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/sign-up/enterprise')
        .set('x-api-key', API_KEY)
        .send({
          email: otherEmail,
          password: 'SecurePassword123!',
          phone: '+84987654321',
          fullName: 'E2E Authz Other',
        });

      const signInRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/sign-in')
        .set('x-api-key', API_KEY)
        .send({
          email: otherEmail,
          password: 'SecurePassword123!',
        });

      const scopeLessToken = signInRes.body.data.accessToken;

      // Try to select workspace they don't belong to
      const selectRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/workspace/select')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${scopeLessToken}`)
        .send({ enterpriseId })
        .expect(403);

      expect(selectRes.body.success).toBe(false);
      expect(selectRes.body.error.code).toBe('FORBIDDEN');

      // Cleanup
      await userModel.deleteMany({ email: otherEmail });
    });

    it('should preserve workspace scope on token refresh', async () => {
      // Sign in and select workspace
      const signInRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/sign-in')
        .set('x-api-key', API_KEY)
        .send({
          email: ownerEmail,
          password: 'SecurePassword123!',
        });

      const scopeLessToken = signInRes.body.data.accessToken;

      const selectRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/workspace/select')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${scopeLessToken}`)
        .send({ enterpriseId });

      const refreshToken = selectRes.body.data.refreshToken;

      // Refresh token
      const refreshRes = await request(app.getHttpServer())
        .post('/hivek/client/v1/auth/refresh-token')
        .set('x-api-key', API_KEY)
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();

      // Verify new token still has workspace scope
      const profileRes = await request(app.getHttpServer())
        .get('/hivek/client/v1/auth/profile')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`)
        .expect(200);

      expect(profileRes.body.success).toBe(true);
    });
  });
});

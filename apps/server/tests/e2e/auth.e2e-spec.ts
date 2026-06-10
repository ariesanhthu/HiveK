import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../../src/infrastructure/modules/app.module';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('Auth Domain (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<any>;
  const testEmail = 'e2e-auth-test@hivek.com';
  const API_KEY = process.env.API_KEY || 'HiveK_ApiKey';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Clean up test user in case it stayed from previous run
    await userModel.deleteMany({ email: testEmail });
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: testEmail });
    await userModel.deleteMany({ email: 'e2e-auth-duplicate@hivek.com' });
    await app.close();
  });

  it('should successfully sign up a KOL, sign in, and get profile', async () => {
    // 1. Sign Up
    const signUpRes = await request(app.getHttpServer())
      .post('/hivek/client/v1/auth/sign-up/kol')
      .set('x-api-key', API_KEY)
      .send({
        email: testEmail,
        password: 'SecurePassword123!',
        phone: '+84123456789',
        fullName: 'E2E Test User',
      })
      .expect(201);

    expect(signUpRes.body.success).toBe(true);
    const signUpData = signUpRes.body.data;
    expect(signUpData.userId).toBeDefined();

    // 2. Sign In
    const signInRes = await request(app.getHttpServer())
      .post('/hivek/client/v1/auth/sign-in')
      .set('x-api-key', API_KEY)
      .send({
        email: testEmail,
        password: 'SecurePassword123!',
      })
      .expect(200);

    expect(signInRes.body.success).toBe(true);
    const signInData = signInRes.body.data;
    expect(signInData.accessToken).toBeDefined();
    expect(signInData.refreshToken).toBeDefined();

    const accessToken = signInData.accessToken;

    // 3. Get Profile
    const profileRes = await request(app.getHttpServer())
      .get('/hivek/client/v1/auth/profile')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(profileRes.body.success).toBe(true);
    const profileData = profileRes.body.data;
    expect(profileData.email).toBe(testEmail);
  });

  it('should return 401 when accessing profile without token', async () => {
    const res = await request(app.getHttpServer())
      .get('/hivek/client/v1/auth/profile')
      .set('x-api-key', API_KEY)
      .expect(401);
    
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 when accessing profile with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/hivek/client/v1/auth/profile')
      .set('x-api-key', API_KEY)
      .set('Authorization', 'Bearer invalid-jwt-token')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 when refreshing with invalid refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/hivek/client/v1/auth/refresh-token')
      .set('x-api-key', API_KEY)
      .send({ refreshToken: 'invalid-token' })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 when signing out without auth token', async () => {
    const res = await request(app.getHttpServer())
      .post('/hivek/client/v1/auth/sign-out')
      .set('x-api-key', API_KEY)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 when signing in with wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/hivek/client/v1/auth/sign-in')
      .set('x-api-key', API_KEY)
      .send({
        email: testEmail,
        password: 'WrongPassword!',
      })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 when signing in with non-existent email', async () => {
    const res = await request(app.getHttpServer())
      .post('/hivek/client/v1/auth/sign-in')
      .set('x-api-key', API_KEY)
      .send({
        email: 'nonexistent@hivek.com',
        password: 'SecurePassword123!',
      })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 409 when signing up with duplicate email', async () => {
    const res = await request(app.getHttpServer())
      .post('/hivek/client/v1/auth/sign-up/kol')
      .set('x-api-key', API_KEY)
      .send({
        email: testEmail,
        password: 'SecurePassword123!',
        phone: '+84123456789',
      })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});

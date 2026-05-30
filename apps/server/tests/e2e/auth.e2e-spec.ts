import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './../../src/app.module';

describe('Auth Domain (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<any>;
  const testEmail = 'e2e-auth-test@hivek.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Clean up test user in case it stayed from previous run
    await userModel.deleteMany({ email: testEmail });
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: testEmail });
    await app.close();
  });

  it('should successfully sign up a KOL, sign in, and get profile', async () => {
    // 1. Sign Up
    const signUpRes = await request(app.getHttpServer())
      .post('/auth/sign-up/kol')
      .send({
        email: testEmail,
        password: 'SecurePassword123!',
      })
      .expect(201);

    expect(signUpRes.body).toBeDefined();

    // 2. Sign In
    const signInRes = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: testEmail,
        password: 'SecurePassword123!',
      })
      .expect(200);

    expect(signInRes.body.accessToken).toBeDefined();
    expect(signInRes.body.refreshToken).toBeDefined();

    const accessToken = signInRes.body.accessToken;

    // 3. Get Profile
    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(profileRes.body.email).toBe(testEmail);
    expect(profileRes.body.fullName).toBe('DEFAULT NAME');
  });
});

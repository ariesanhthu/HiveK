import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';

describe('Enterprise Domain (e2e)', () => {
  let app: INestApplication;
  let jwtService: IAuthJwtService;
  let enterpriseModel: Model<any>;
  let userModel: Model<any>;

  const testUserId = '64f7b2c9e8b3c9001f3e4e92';
  const secondUserId = '64f7b2c9e8b3c9001f3e4e93';
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    enterpriseModel = app.get<Model<any>>(getModelToken('EnterpriseModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Create user so we can link it
    await userModel.deleteMany({ _id: { $in: [new Types.ObjectId(testUserId), new Types.ObjectId(secondUserId)] } });
    
    const commonUserProps = {
      phone: '0000000000',
      password_hash: 'password123',
      type: 'enterprise',
      role_id: new Types.ObjectId(),
      is_email_verified: false,
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

    await userModel.collection.insertOne({
        ...commonUserProps,
        _id: new Types.ObjectId(secondUserId),
        email: 'other-user-e2e@hivek.com',
        full_name: 'Other User E2E',
      });

    // Generate JWT Auth Token
    authToken = jwtService.sign({
      sub: testUserId,
      email: 'enterprise-owner-e2e@hivek.com',
      role: 'enterprise',
    });

    await enterpriseModel.deleteMany({ user_id: { $in: [testUserId, secondUserId] } });
  });

  afterAll(async () => {
    await enterpriseModel.deleteMany({ user_id: { $in: [testUserId, secondUserId] } });
    await userModel.deleteMany({ _id: { $in: [new Types.ObjectId(testUserId), new Types.ObjectId(secondUserId)] } });
    await app.close();
  });

  it('should manage enterprise profile lifecycle', async () => {
    // 1. Create Enterprise Profile
    const createRes = await request(app.getHttpServer())
      .post('/enterprises')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyName: 'Enterprise E2E Inc',
        description: 'E2E Testing Company',
        contactEmail: 'e2e@company.com',
        contactPhone: '0987654321',
        website: 'https://company-e2e.com',
        taxId: 'TAX-12345',
      })
      .expect(201);

    expect(createRes.body.companyName).toBe('Enterprise E2E Inc');
    const enterpriseId = createRes.body.id;

    // Verify creator was added to enterprise_ids
    const creator = await userModel.findById(testUserId);
    expect(creator.enterprise_ids.map((id: any) => id.toString())).toContain(enterpriseId);

    // 2. Update Enterprise Profile
    const updateRes = await request(app.getHttpServer())
      .patch(`/enterprises/${enterpriseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyName: 'Enterprise E2E Inc Updated',
        description: 'Updated Description',
      })
      .expect(200);

    expect(updateRes.body.companyName).toBe('Enterprise E2E Inc Updated');

    // 3. Get Enterprise Profile
    const getRes = await request(app.getHttpServer())
      .get(`/enterprises/${enterpriseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getRes.body.companyName).toBe('Enterprise E2E Inc Updated');
    expect(getRes.body.description).toBe('Updated Description');

    // 4. Add another user to enterprise
    await request(app.getHttpServer())
        .post(`/enterprises/${enterpriseId}/users/${secondUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    
    const otherUser = await userModel.findById(secondUserId);
    expect(otherUser.enterprise_ids.map((id: any) => id.toString())).toContain(enterpriseId);

    // 5. Revoke user from enterprise
    await request(app.getHttpServer())
        .delete(`/enterprises/${enterpriseId}/users/${secondUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    
    const revokedUser = await userModel.findById(secondUserId);
    expect(revokedUser.enterprise_ids.map((id: any) => id.toString())).not.toContain(enterpriseId);
  });
});

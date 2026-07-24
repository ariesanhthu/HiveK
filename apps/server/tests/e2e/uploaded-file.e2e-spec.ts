import {
  AUTH_JWT_SERVICE,
  type IAuthJwtService,
} from '@/application/interfaces/auth-jwt.interface';
import { STORAGE_SERVICE } from '@/core/interfaces/storage';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../../src/infrastructure/modules/app.module';

describe('Uploaded File Domain (e2e)', () => {
  let app: INestApplication;
  let fileModel: Model<any>;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let authToken: string;
  const testAdminId = '64f7b2c9e8b3c9001f3e4e94';
  const API_KEY = process.env.API_KEY || 'HiveK_ApiKey';

  const mockStorageService = {
    upload: jest.fn().mockResolvedValue({
      url: 'https://cloudinary.com/test-file.jpg',
      format: 'jpg',
      size: 1024,
      publicId: 'test-public-id-e2e',
    }),
    delete: jest.fn().mockResolvedValue(true),
    deleteMany: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(STORAGE_SERVICE)
      .useValue(mockStorageService)
      .compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    authToken = jwtService.sign({
      sub: testAdminId,
      email: 'upload-tester@hivek.com',
      role: 'admin',
    });

    fileModel = app.get<Model<any>>(getModelToken('UploadedFileModel'));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Seed admin user
    await userModel.deleteMany({ _id: new Types.ObjectId(testAdminId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(testAdminId),
      email: 'upload-tester@hivek.com',
      full_name: 'Upload Tester',
      phone: '+84123456785',
      password_hash: 'password123',
      type: 'admin',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      enterprise_ids: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Clean up E2E file documents
    await fileModel.deleteMany({ target_id: '64f7b2c9e8b3c9001f3e4e94' });
  });

  afterAll(async () => {
    await fileModel.deleteMany({ target_id: '64f7b2c9e8b3c9001f3e4e94' });
    await userModel.deleteMany({ _id: new Types.ObjectId(testAdminId) });
    await app.close();
  });

  it('should upload a file and manage its lifecycle', async () => {
    // 1. Upload File
    const uploadRes = await request(app.getHttpServer())
      .post('/hivek/admin/v1/upload')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('fake image content'), 'test_avatar.jpg')
      .field('targetType', 'campaign')
      .field('targetId', '64f7b2c9e8b3c9001f3e4e94')
      .field('targetField', 'banner')
      .expect(201);

    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.data.url).toBe('https://cloudinary.com/test-file.jpg');
    const fileId = uploadRes.body.data.id;

    // 2. Get uploaded file metadata
    const getRes = await request(app.getHttpServer())
      .get(`/hivek/admin/v1/upload/${fileId}`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.url).toBe('https://cloudinary.com/test-file.jpg');

    // 3. Find All uploaded files
    const listRes = await request(app.getHttpServer())
      .get('/hivek/admin/v1/upload')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .query({ targetId: '64f7b2c9e8b3c9001f3e4e94' })
      .expect(200);

    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Restore
    await request(app.getHttpServer())
      .patch(`/hivek/admin/v1/upload/${fileId}/restore`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });
});

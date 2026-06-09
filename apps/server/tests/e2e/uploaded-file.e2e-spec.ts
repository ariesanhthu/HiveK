import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { STORAGE_SERVICE } from '@/core/interfaces/storage';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('Uploaded File Domain (e2e)', () => {
  let app: INestApplication;
  let fileModel: Model<any>;
  let userModel: Model<any>;
  let jwtService: IAuthJwtService;
  let authToken: string;
  const testAdminId = '64f7b2c9e8b3c9001f3e4e94';

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
      .post('/hivek/api/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('fake image content'), 'test_avatar.jpg')
      .field('targetType', 'CAMPAIGN')
      .field('targetId', '64f7b2c9e8b3c9001f3e4e94')
      .field('targetField', 'banner')
      .expect(201);

    expect(uploadRes.body.url).toBe('https://cloudinary.com/test-file.jpg');
    const fileId = uploadRes.body.id;

    // 2. Get uploaded file metadata
    const getRes = await request(app.getHttpServer())
      .get(`/hivek/api/upload/${fileId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getRes.body.url).toBe('https://cloudinary.com/test-file.jpg');

    // 3. Find All uploaded files
    const listRes = await request(app.getHttpServer())
      .get('/hivek/api/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ targetId: '64f7b2c9e8b3c9001f3e4e94' })
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Restore
    await request(app.getHttpServer())
      .patch(`/hivek/api/upload/${fileId}/restore`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});

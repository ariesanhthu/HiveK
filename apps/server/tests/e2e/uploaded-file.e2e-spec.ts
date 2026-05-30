import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './../../src/app.module';
import { STORAGE_SERVICE } from '@/core/interfaces/storage';

describe('Uploaded File Domain (e2e)', () => {
  let app: INestApplication;
  let fileModel: Model<any>;

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
    await app.init();

    fileModel = app.get<Model<any>>(getModelToken('UploadedFileModel'));

    // Clean up E2E file documents
    await fileModel.deleteMany({ target_id: '64f7b2c9e8b3c9001f3e4e94' });
  });

  afterAll(async () => {
    await fileModel.deleteMany({ target_id: '64f7b2c9e8b3c9001f3e4e94' });
    await app.close();
  });

  it('should upload a file and manage its lifecycle', async () => {
    // 1. Upload File
    const uploadRes = await request(app.getHttpServer())
      .post('/upload')
      .attach('file', Buffer.from('fake image content'), 'test_avatar.jpg')
      .field('targetType', 'CAMPAIGN')
      .field('targetId', '64f7b2c9e8b3c9001f3e4e94')
      .field('targetField', 'banner')
      .expect(201);

    expect(uploadRes.body.url).toBe('https://cloudinary.com/test-file.jpg');
    const fileId = uploadRes.body.id;

    // 2. Get uploaded file metadata
    const getRes = await request(app.getHttpServer())
      .get(`/upload/${fileId}`)
      .expect(200);

    expect(getRes.body.url).toBe('https://cloudinary.com/test-file.jpg');

    // 3. Find All uploaded files
    const listRes = await request(app.getHttpServer())
      .get('/upload')
      .query({ targetId: '64f7b2c9e8b3c9001f3e4e94' })
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 4. Soft Delete
    await request(app.getHttpServer())
      .patch(`/upload/${fileId}/soft-delete`)
      .query({ deletedBy: 'E2E-Tester' })
      .expect(204);

    // 5. Restore
    await request(app.getHttpServer())
      .patch(`/upload/${fileId}/restore`)
      .expect(200);

    // 6. Hard Delete
    await request(app.getHttpServer())
      .delete(`/upload/${fileId}`)
      .expect(204);

    // 7. Verify Gone
    await request(app.getHttpServer())
      .get(`/upload/${fileId}`)
      .expect(404);
  });
});

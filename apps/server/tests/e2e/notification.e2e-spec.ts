import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { AppModule } from '../../src/infrastructure/modules/app.module';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces/auth-jwt.interface';
import { NotificationType, NotificationChannel } from '@/core/enums';
import { NotificationSendCommand } from '@/application/commands';
import { NotificationModel, UserNotificationModel } from '@/infrastructure/mongo/schemas';
import { setupApplication } from '@/infrastructure/nest-config/app.setup';

describe('Notification System (e2e)', () => {
  let app: INestApplication;
  let jwtService: IAuthJwtService;
  let commandBus: CommandBus;
  let notificationModel: Model<any>;
  let userNotificationModel: Model<any>;
  let userModel: Model<any>;

  const testUserId = '64f7b2c9e8b3c9001f3e4e90';
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    jwtService = app.get<IAuthJwtService>(AUTH_JWT_SERVICE);
    commandBus = app.get<CommandBus>(CommandBus);
    notificationModel = app.get<Model<any>>(getModelToken(NotificationModel.name));
    userNotificationModel = app.get<Model<any>>(getModelToken(UserNotificationModel.name));
    userModel = app.get<Model<any>>(getModelToken('UserModel'));

    // Seed test user
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });
    await userModel.collection.insertOne({
      _id: new Types.ObjectId(testUserId),
      email: 'e2e-tester@hivek.com',
      full_name: 'Notification Tester',
      phone: '+84123456782',
      password_hash: 'hash',
      type: 'kol',
      role_id: new Types.ObjectId().toString(),
      is_email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Generate JWT Auth Token for test user
    authToken = jwtService.sign({
      sub: testUserId,
      email: 'e2e-tester@hivek.com',
      role: 'kol',
    });
  });

  afterAll(async () => {
    // Clean up created test data
    await notificationModel.deleteMany({ title: 'E2E Test Notification' });
    await userNotificationModel.deleteMany({ recipient_id: new Types.ObjectId(testUserId) });
    await userModel.deleteMany({ _id: new Types.ObjectId(testUserId) });

    await app.close();
  });

  it('should return 401 Unauthorized if no auth token is provided', async () => {
    await request(app.getHttpServer())
      .get('/hivek/api/notifications')
      .expect(401);
  });

  it('should flow through the notification lifecycle: fetch, read status update, and dismiss', async () => {
    // 1. Create a notification for the test user using CommandBus
    await commandBus.execute(
      new NotificationSendCommand({
        type: NotificationType.SYSTEM,
        title: 'E2E Test Notification',
        content: 'This is a test notification payload',
        channels: [NotificationChannel.IN_APP],
        audience: {
          broadcastType: 'direct',
          userIds: [testUserId],
        },
      })
    );

    // Wait for the asynchronous Event Handler to write to the database
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 2. GET /notifications - verify notification is in list and isRead is false
    const listRes = await request(app.getHttpServer())
      .get('/hivek/api/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    const targetNoti = listRes.body.data.find(
      (n: any) => n.title === 'E2E Test Notification'
    );
    expect(targetNoti).toBeDefined();
    expect(targetNoti.content).toBe('This is a test notification payload');
    expect(targetNoti.isRead).toBe(false);

    const receiptId = targetNoti.id;

    // 3. PATCH /notifications/read-status - update read status for specific IDs
    await request(app.getHttpServer())
      .patch('/hivek/api/notifications/read-status')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ids: [receiptId], isRead: true })
      .expect(204);

    // 4. GET /notifications - verify notification is now isRead = true
    const checkReadRes = await request(app.getHttpServer())
      .get('/hivek/api/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const updatedNoti = checkReadRes.body.data.find(
      (n: any) => n.id === receiptId
    );
    expect(updatedNoti).toBeDefined();
    expect(updatedNoti.isRead).toBe(true);

    // 5. PATCH /notifications/soft-delete - dismiss notification bulk
    await request(app.getHttpServer())
      .patch('/hivek/api/notifications/soft-delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ids: [receiptId] })
      .expect(204);

    // 6. GET /notifications - verify notification is no longer in the list
    const checkDeletedRes = await request(app.getHttpServer())
      .get('/hivek/api/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const finalNoti = checkDeletedRes.body.data.find(
      (n: any) => n.id === receiptId
    );
    expect(finalNoti).toBeUndefined();
  });

  it('should support mark all update via read-status endpoint without ids', async () => {
    // Ensure we have at least one notification
    await commandBus.execute(
      new NotificationSendCommand({
        type: NotificationType.SYSTEM,
        title: 'E2E Test Notification',
        content: 'Mark all test',
        channels: [NotificationChannel.IN_APP],
        audience: {
          broadcastType: 'direct',
          userIds: [testUserId],
        },
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mark all as read using the unified endpoint
    await request(app.getHttpServer())
      .patch('/hivek/api/notifications/read-status')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ isRead: true }) // no ids provided
      .expect(204);

    // Verify all are read
    const res = await request(app.getHttpServer())
      .get('/hivek/api/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    res.body.data.forEach((n: any) => {
      expect(n.isRead).toBe(true);
    });
  });
});

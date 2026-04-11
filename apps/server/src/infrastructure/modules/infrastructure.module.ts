import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoModule } from '../mongo/mongo.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env`,
		}),
		CqrsModule,
		MongoModule,
	],
	providers: [],
	exports: [
		MongoModule,
	],
})
export class InfrastructureModule {}

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('HiveK API')
    .setDescription('The API documentation for the HiveK Platform.')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    // .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const swaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationSorter: 'alpha',
      security: [{ 'x-api-key': [] }],
    },
  };
    
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('hivek/api/docs', app, documentFactory, swaggerCustomOptions);
}

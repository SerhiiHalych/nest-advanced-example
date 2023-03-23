/* eslint-disable no-console */
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './common/infrastructure/api/filters/HttpExceptionFilter';
import { ValidationFilter } from './common/infrastructure/api/filters/ValidationFilter';
import { StringSanitizerInterceptor } from './common/infrastructure/api/interceptors/StringSanitizerInterceptor';
import { CorsAllowIoAdapter } from './common/infrastructure/gateway/AuthorizedIoAdapter';
import { CommunicationGooglePubSub } from './resources/communications/infrastructure/services/CommunicationGooglePubSub';
import { GoogleGmailService } from './resources/communications/infrastructure/services/GoogleGmailService';
import { GoogleOAuth } from './resources/communications/infrastructure/services/GoogleOAuth';

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', { error });
});

process.on('uncaughtException', error => {
  console.error('uncaughtException', { error });
});

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new HttpExceptionFilter(), new ValidationFilter());

  app.useGlobalInterceptors(new StringSanitizerInterceptor());

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  app.useWebSocketAdapter(new CorsAllowIoAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('Foobar CRM API')
    .setDescription('Foobar CRM API provides way to operate within Foobar business flow')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'Authorization')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(3000);

  const communicationGooglePubSub = app.get(CommunicationGooglePubSub);
  const googleOAuth = app.get(GoogleOAuth);
  const googleGmailService = app.get(GoogleGmailService);

  await communicationGooglePubSub.subscribeToNewEmails();
  await googleOAuth.loadCredentials();
  await googleGmailService.watchEmailInbox('me');
}

bootstrap();

import 'reflect-metadata';

import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { CommonModule } from '../common/common.module';
import { BaseType, CommandHandlerType, ProviderType } from '../common/diTokens';
import { GlobalDBContext } from '../common/infrastructure/persistance/GlobalDBContext';
import appConfig from '../config/app.config';
import authConfig from '../config/auth.config';
import twilioConfig from '../config/twilio.config';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { BuildingsModule } from '../resources/buildings/buildings.module';
import { HandleGettingOfIncomingEmailCommandHandler } from '../resources/communications/application/commands/handleGettingOfIncomingEmail/HandleGettingOfIncomingEmailCommandHandler';
import { TasksService } from '../resources/communications/application/cronJobs/CommunicationTasksService';
import { GmailEventHandler } from '../resources/communications/application/eventHandlers/GmailEventHandler';
import { CommunicationsModule } from '../resources/communications/communications.module';
import { CommunicationGooglePubSub } from '../resources/communications/infrastructure/services/CommunicationGooglePubSub';
import { GoogleGmailService } from '../resources/communications/infrastructure/services/GoogleGmailService';
import { GoogleOAuth } from '../resources/communications/infrastructure/services/GoogleOAuth';
import { ContactsModule } from '../resources/contacts/contacts.module';
import { FoobarCoreContactSource } from '../resources/contacts/infrastructure/services/foobarCoreContactSource/FoobarCoreContactSource';
import { EmployeesModule } from '../resources/employees/employees.module';
import { SettingsModule } from '../resources/settings/settings.module';
import { UsersModule } from '../resources/users/users.module';
import pgConfig from './../config/pg.config';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';

enum Environment {
  TEST = 'test',
  LOCAL = 'local',
  DEVELOPMENT = 'dev',
  STAGING = 'stage',
  PRODUCTION = 'prod',
}

const ENV = process.env.ENV as Environment;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: `${process.env.PWD}/.env.${ENV}`,
      isGlobal: true,
      load: [appConfig, authConfig, pgConfig, twilioConfig],
      expandVariables: true,
    }),
    CommonModule,
    InfrastructureModule,
    UsersModule,
    EmployeesModule,
    ContactsModule,
    BuildingsModule,
    CommunicationsModule,
    SettingsModule,
  ],
  controllers: [],
  exports: [],

  // Registering deps into IoC container within current module
  // Creates an entry point to the new Dependency branch
  // Importing such module as a global one detaches it from Dep tree
  // and creates new seedling.
  providers: [
    {
      provide: BaseType.GLOBAL_DB_CONTEXT,
      useClass: GlobalDBContext,
    },
    CommunicationGooglePubSub,
    GoogleGmailService,
    GmailEventHandler,
    GoogleOAuth,
    TasksService,
    {
      provide: ProviderType.EXTERNAL_CONTACT_PROVIDER,
      useClass: FoobarCoreContactSource,
    },
    {
      provide: CommandHandlerType.HANDLE_GETTING_OF_INCOMING_EMAIL,
      useClass: HandleGettingOfIncomingEmailCommandHandler,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}

import { Module } from '@nestjs/common';

import { CommandHandlerType, QueryHandlerType, ServiceType } from '../../common/diTokens';
import { GoogleOAuth2Service } from '../users/infrastructure/services/authService/GoogleOAuth2Service';
import { HandleOAuthRedirectCommandHandler } from './application/commands/handleOAuthRedirect/HandleOAuthRedirectCommandHandler';
import { GetAuthorizationUrlQueryHandler } from './application/queries/getAuthorizationUrl/GetAuthorizationUrlQueryHandler';
import { GetSettingsQueryHandler } from './application/queries/getSettings/GetSettingsQueryHandler';
import { SettingsController } from './infrastructure/api/SettingsController';

@Module({
  controllers: [SettingsController],
  providers: [
    // Commands
    {
      provide: CommandHandlerType.HANDLE_O_AUTH_REDIRECT,
      useClass: HandleOAuthRedirectCommandHandler,
    },

    // Queries
    {
      provide: QueryHandlerType.GET_AUTHORIZATION_URL,
      useClass: GetAuthorizationUrlQueryHandler,
    },
    {
      provide: QueryHandlerType.GET_SETTINGS,
      useClass: GetSettingsQueryHandler,
    },

    // Services
    {
      provide: ServiceType.AUTH_SERVICE,
      useClass: GoogleOAuth2Service,
    },
  ],
})
export class SettingsModule {}

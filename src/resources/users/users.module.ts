import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CommandHandlerType, ServiceType } from '../../common/diTokens';
import { AuthorizeUserCommandHandler } from './application/commands/authorizeUser/AuthorizeUserCommandHandler';
import { DeactivateUserCommandHandler } from './application/commands/deactivateUser/DeactivateUserCommandHandler';
import { AuthController } from './infrastructure/api/AuthController';
import { GoogleOAuth2Service } from './infrastructure/services/authService/GoogleOAuth2Service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.OAUTH_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Commands
    {
      provide: CommandHandlerType.DEACTIVATE_USER,
      useClass: DeactivateUserCommandHandler,
    },
    {
      provide: CommandHandlerType.AUTHORIZE_USER,
      useClass: AuthorizeUserCommandHandler,
    },

    // Services
    {
      provide: ServiceType.AUTH_SERVICE,
      useClass: GoogleOAuth2Service,
    },
  ],
})
export class UsersModule {}

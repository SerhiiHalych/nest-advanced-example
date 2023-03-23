import { Controller, Get, Inject, Query, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { CommandHandlerType, QueryHandlerType } from '../../../../common/diTokens';
import { JwtAuthGuard } from '../../../../common/infrastructure/api/guards/jwt-auth.guard';
import { validateRequest } from '../../../../common/infrastructure/validation/joi/validateRequest';
import { IHandleOAuthRedirectCommandHandler } from '../../application/commands/handleOAuthRedirect/IHandleOAuthRedirectCommandHandler';
import { IGetAuthorizationUrlQueryHandler } from '../../application/queries/getAuthorizationUrl/IGetAuthorizationUrlQueryHandler';
import { IGetSettingsQueryHandler } from '../../application/queries/getSettings/IGetSettingsQueryHandler';
import { GetSettingsResponse } from './getSettings/GetSettingsResponse';
import { communicationEmailCallbackRequestSchema } from './сommunicationEmailCallback/CommunicationEmailCallbackRequest';

@ApiTags('Settings')
@Controller({ path: 'settings' })
export class SettingsController {
  constructor(
    @Inject(CommandHandlerType.HANDLE_O_AUTH_REDIRECT)
    private handleOAuthRedirectCommandHandler: IHandleOAuthRedirectCommandHandler,

    @Inject(QueryHandlerType.GET_AUTHORIZATION_URL)
    private getAuthorizationUrlQueryHandler: IGetAuthorizationUrlQueryHandler,

    @Inject(QueryHandlerType.GET_SETTINGS) private getSettingsQueryHandler: IGetSettingsQueryHandler
  ) {}

  @Get()
  @ApiResponse({ type: GetSettingsResponse })
  async getSettings(): Promise<GetSettingsResponse> {
    const result = await this.getSettingsQueryHandler.execute();

    return {
      communicationEmail: result.communicationEmail,
    };
  }

  @UseInterceptors(validateRequest(communicationEmailCallbackRequestSchema))
  @Get('communication-email/callback')
  async communicationEmailCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response
  ): Promise<void> {
    const [, ...redirectTo] = state.split('=');

    await this.handleOAuthRedirectCommandHandler.execute({
      code,
    });

    res.redirect(redirectTo.join('='));
  }

  @UseGuards(JwtAuthGuard)
  @Get('communication-email/setup')
  @ApiResponse({ type: String })
  async setupCommunicationEmail(@Query('redirectTo') redirectTo: string): Promise<string> {
    const result = await this.getAuthorizationUrlQueryHandler.execute({
      redirectTo,
    });

    return result.url;
  }
}

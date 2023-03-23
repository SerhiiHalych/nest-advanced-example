import { Body, Controller, Inject, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CommandHandlerType } from '../../../../common/diTokens';
import { IntegrationJwtAuthGuard } from '../../../../common/infrastructure/api/guards/integration-jwt-auth.guard';
import { validateRequest } from '../../../../common/infrastructure/validation/joi/validateRequest';
import { IHandleGettingOfIncomingBuildingChatItemCommandHandler } from '../../application/commands/handleGettingOfIncomingBuildingChatItem/IHandleGettingOfIncomingBuildingChatItemCommandHandler';
import {
  HandleGettingOfIncomingBuildingChatItemRequestBody,
  handleGettingOfIncomingBuildingChatItemRequestSchema,
} from './handleGettingOfIncomingBuildingChatItem/HandleGettingOfIncomingBuildingChatItemRequest.ts';

@ApiTags('Communications resource', 'Integration')
@ApiBearerAuth('access-token')
@Controller({
  path: 'integration/communications',
})
export class CommunicationIntegrationController {
  constructor(
    @Inject(CommandHandlerType.HANDLE_GETTING_OF_INCOMING_BUILDING_CHAT_ITEM)
    private handleGettingOfIncomingBuildingChatItemCommandHandler: IHandleGettingOfIncomingBuildingChatItemCommandHandler
  ) {}

  @UseGuards(IntegrationJwtAuthGuard)
  @ApiOperation({ summary: 'Send building chat message' })
  @UseInterceptors(validateRequest(handleGettingOfIncomingBuildingChatItemRequestSchema))
  @Post('/building-chats/messages')
  async getMessage(@Body() body: HandleGettingOfIncomingBuildingChatItemRequestBody): Promise<void> {
    await this.handleGettingOfIncomingBuildingChatItemCommandHandler.execute({
      externalBuildingId: body.foobarBuildingId,
      externalContactId: body.foobarContactId,
      text: body.text,
    });
  }
}

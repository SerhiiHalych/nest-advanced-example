/* eslint-disable @typescript-eslint/naming-convention */
import { Message } from '@google-cloud/pubsub';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';

import { CommandHandlerType } from '../../../../common/diTokens';
import type { IHandleGettingOfIncomingEmailCommandHandler } from '../commands/handleGettingOfIncomingEmail/IHandleGettingOfIncomingEmailCommandHandler';

@Injectable()
export class GmailEventHandler {
  constructor(private moduleRef: ModuleRef) {}

  @OnEvent('gmail.history')
  async invalidateGmailHistory(message: Message): Promise<void> {
    const handleGettingOfIncomingEmailCommandHandler =
      await this.moduleRef.resolve<IHandleGettingOfIncomingEmailCommandHandler>(
        CommandHandlerType.HANDLE_GETTING_OF_INCOMING_EMAIL,
        undefined
      );

    await handleGettingOfIncomingEmailCommandHandler.execute({ message });
  }
}

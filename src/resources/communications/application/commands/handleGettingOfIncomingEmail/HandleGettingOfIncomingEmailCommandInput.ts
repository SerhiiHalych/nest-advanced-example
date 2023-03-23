import type { Message } from '@google-cloud/pubsub';

export interface HandleGettingOfIncomingEmailCommandInput {
  message: Message;
}

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class CommunicationSubscribeAcknowledgeMessagesBody {
  communicationItemIds: string[];
}

export const communicationSubscribeAcknowledgeMessagesBodySchema =
  createObjectSchema<CommunicationSubscribeAcknowledgeMessagesBody>({
    communicationItemIds: extendedJoi.array().items(extendedJoi.string().uuid()),
  });

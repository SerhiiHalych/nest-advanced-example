import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class BuildingChatSubscribeAcknowledgeMessagesBody {
  buildingChatItemIds: string[];
}

export const buildingChatSubscribeAcknowledgeMessagesBodySchema =
  createObjectSchema<BuildingChatSubscribeAcknowledgeMessagesBody>({
    buildingChatItemIds: extendedJoi.array().items(extendedJoi.string().uuid()),
  });

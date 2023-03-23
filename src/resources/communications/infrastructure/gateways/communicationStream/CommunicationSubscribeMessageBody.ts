import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class CommunicationSubscribeMessageBody {
  contactId: string;
}

export const communicationSubscribeMessageBodySchema = createObjectSchema<CommunicationSubscribeMessageBody>({
  contactId: extendedJoi.string().uuid(),
});

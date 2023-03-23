import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

class SearchContentRequestQuery {
  content: string;
}

class SearchContentRequestParams {
  contactId: string;
}

export const searchContentRequestSchema = createRequestSchema({
  query: createObjectSchema<SearchContentRequestQuery>({
    content: extendedJoi.string(),
  }),
  params: createObjectSchema<SearchContentRequestParams>({
    contactId: extendedJoi.string().uuid(),
  }),
});

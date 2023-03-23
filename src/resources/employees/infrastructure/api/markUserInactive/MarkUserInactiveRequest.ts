import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export const markUserInactiveRequest = createRequestSchema({
  params: createObjectSchema<{
    employeeId: string;
  }>({
    employeeId: extendedJoi.string().uuid(),
  }),
});

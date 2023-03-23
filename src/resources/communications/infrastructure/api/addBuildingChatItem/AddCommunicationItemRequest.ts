import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { BuildingChatItemType } from '../../../application/enum/BuildingChatItemType';

class AddBuildingChatItemRequestBodyPayload {
  @ApiPropertyOptional()
  text: string;
}

export class AddBuildingChatItemRequestBody {
  @ApiProperty()
  contactId: string;

  @ApiProperty()
  buildingId: string;

  @ApiProperty({ type: AddBuildingChatItemRequestBodyPayload })
  payload: AddBuildingChatItemRequestBodyPayload;

  @ApiProperty({ enum: BuildingChatItemType })
  type: BuildingChatItemType.OUTGOING_MESSAGE | BuildingChatItemType.PRIVATE_NOTES;
}

export const addBuildingChatItemRequestSchema = createRequestSchema({
  body: createObjectSchema<AddBuildingChatItemRequestBody>({
    contactId: extendedJoi.string().uuid(),
    buildingId: extendedJoi.string().uuid(),
    payload: extendedJoi.any().custom(value => JSON.parse(value)) as any,
    type: extendedJoi.string().valid(...Object.values(BuildingChatItemType)),
  }),
});

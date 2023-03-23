import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { AcquisitionChannel } from '../../../application/enum/AcquisitionChannel';
import { CommunicationPreference } from '../../../application/enum/CommunicationPreference';

export class CreateNewContactRequestBody {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional({ isArray: true, enum: CommunicationPreference })
  contactStyle?: CommunicationPreference[];

  @ApiPropertyOptional({ enum: AcquisitionChannel })
  cameFrom?: AcquisitionChannel;
}

export const createNewContactRequestSchema = createRequestSchema({
  body: createObjectSchema<CreateNewContactRequestBody>({
    firstName: extendedJoi.string().pattern(new RegExp("^([\\w'-]+\\s?)+$")).min(2).max(50),
    lastName: extendedJoi.string().pattern(new RegExp("^([\\w'-]+\\s?)+$")).min(2).max(50),
    email: extendedJoi
      .string()
      .min(6)
      .max(66)
      .email({ tlds: { allow: false } }),
    phone: extendedJoi.e164PhoneNumber(),
    contactStyle: extendedJoi
      .array()
      .items(...Object.values(CommunicationPreference))
      .optional(),
    cameFrom: extendedJoi
      .string()
      .valid(...Object.values(AcquisitionChannel))
      .optional(),
  }),
});

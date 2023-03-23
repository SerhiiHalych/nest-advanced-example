import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { AcquisitionChannel } from '../../../application/enum/AcquisitionChannel';
import { CommunicationPreference } from '../../../application/enum/CommunicationPreference';

export class EditContactRequestBody {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ isArray: true, enum: CommunicationPreference })
  contactStyle: CommunicationPreference[];

  @ApiPropertyOptional({ enum: AcquisitionChannel })
  cameFrom?: AcquisitionChannel;
}

export const editContactRequestSchema = createRequestSchema({
  body: createObjectSchema<EditContactRequestBody>({
    firstName: extendedJoi.string().pattern(new RegExp("^([\\w'-]+\\s?)+$")).min(2).max(50).optional(),
    lastName: extendedJoi.string().pattern(new RegExp("^([\\w'-]+\\s?)+$")).min(2).max(50).optional(),
    email: extendedJoi
      .string()
      .email({ tlds: { allow: false } })
      .min(6)
      .max(66)
      .optional(),
    phone: extendedJoi.e164PhoneNumber().optional(),
    contactStyle: extendedJoi
      .array()
      .items(...Object.values(CommunicationPreference))
      .optional(),
    cameFrom: extendedJoi
      .string()
      .valid(...Object.values(AcquisitionChannel))
      .allow(null)
      .optional(),
  }),
});

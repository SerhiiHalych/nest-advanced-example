import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { AcquisitionChannel } from '../../../application/enum/AcquisitionChannel';
import { CommunicationPreference } from '../../../application/enum/CommunicationPreference';

class EditContactFromExternalSourceRequestBodyAcquisitionData {
  @ApiProperty()
  signUpLink?: string;

  @ApiProperty()
  acquisitionChannel?: string;

  @ApiProperty()
  foobarId?: string;

  @ApiProperty()
  stytchId?: string;

  @ApiProperty()
  referredBy?: string;

  @ApiProperty()
  gAId?: string;

  @ApiProperty()
  source?: string;

  @ApiProperty()
  campaign?: string;

  @ApiProperty()
  term?: string;

  @ApiProperty()
  medium?: string;

  @ApiProperty()
  userIP?: string;

  @ApiProperty()
  device?: string;

  @ApiProperty()
  gclId?: string;
}

export class EditContactFromExternalSourceRequestBody {
  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  phoneIsConfirmed?: boolean;

  @ApiProperty()
  emailIsConfirmed?: boolean;

  @ApiProperty()
  phone?: string;

  @ApiProperty({ isArray: true, enum: CommunicationPreference })
  contactStyle?: CommunicationPreference[];

  @ApiPropertyOptional({ enum: AcquisitionChannel })
  cameFrom?: AcquisitionChannel;

  @ApiProperty({ type: EditContactFromExternalSourceRequestBodyAcquisitionData, nullable: true })
  acquisitionData?: EditContactFromExternalSourceRequestBodyAcquisitionData | null;
}

export const editContactFromExternalSourceRequestSchema = createRequestSchema({
  params: createObjectSchema<{
    contactId?: string;
  }>({
    contactId: extendedJoi.string().uuid(),
  }),
  body: createObjectSchema<EditContactFromExternalSourceRequestBody>({
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
    emailIsConfirmed: extendedJoi.boolean().optional(),
    phoneIsConfirmed: extendedJoi.boolean().optional(),
    acquisitionData: createObjectSchema<EditContactFromExternalSourceRequestBodyAcquisitionData>({
      acquisitionChannel: extendedJoi.string().optional(),
      campaign: extendedJoi.string().optional(),
      device: extendedJoi.string().optional(),
      gAId: extendedJoi.string().optional(),
      gclId: extendedJoi.string().optional(),
      foobarId: extendedJoi.string().optional(),
      medium: extendedJoi.string().optional(),
      referredBy: extendedJoi.string().optional(),
      signUpLink: extendedJoi.string().optional(),
      source: extendedJoi.string().optional(),
      stytchId: extendedJoi.string().optional(),
      term: extendedJoi.string().optional(),
      userIP: extendedJoi.string().optional(),
    })
      .allow(null)
      .optional(),
  }),
});

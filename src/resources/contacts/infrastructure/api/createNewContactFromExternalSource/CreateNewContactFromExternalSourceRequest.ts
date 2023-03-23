import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { AcquisitionChannel } from '../../../application/enum/AcquisitionChannel';
import { CommunicationPreference } from '../../../application/enum/CommunicationPreference';

class CreateNewContactFromExternalSourceRequestBodyAcquisitionData {
  @ApiProperty()
  signUpLink?: string;

  @ApiProperty()
  acquisitionChannel?: string;

  @ApiProperty()
  foobarId: string;

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

export class CreateNewContactFromExternalSourceRequestBody {
  @ApiProperty()
  contactId: string;

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty({ isArray: true, enum: CommunicationPreference })
  contactStyle?: CommunicationPreference[];

  @ApiProperty({ nullable: true, enum: AcquisitionChannel })
  cameFrom?: AcquisitionChannel | null;

  @ApiProperty()
  phoneIsConfirmed: boolean;

  @ApiProperty()
  emailIsConfirmed: boolean;

  @ApiProperty({ type: CreateNewContactFromExternalSourceRequestBodyAcquisitionData, nullable: true })
  acquisitionData: CreateNewContactFromExternalSourceRequestBodyAcquisitionData | null;
}

export const createNewContactFromExternalSourceRequestSchema = createRequestSchema({
  body: createObjectSchema<CreateNewContactFromExternalSourceRequestBody>({
    contactId: extendedJoi.string().uuid(),
    firstName: extendedJoi.string().pattern(new RegExp("^([\\w'-]+\\s?)+$")).min(2).max(50).optional(),
    lastName: extendedJoi.string().pattern(new RegExp("^([\\w'-]+\\s?)+$")).min(2).max(50).optional(),
    email: extendedJoi
      .string()
      .min(6)
      .max(66)
      .email({ tlds: { allow: false } })
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
    phoneIsConfirmed: extendedJoi.boolean(),
    emailIsConfirmed: extendedJoi.boolean(),
    acquisitionData: createObjectSchema<CreateNewContactFromExternalSourceRequestBodyAcquisitionData>({
      signUpLink: extendedJoi.string().optional(),
      acquisitionChannel: extendedJoi.string().optional(),
      foobarId: extendedJoi.string().uuid(),
      stytchId: extendedJoi.string().optional(),
      referredBy: extendedJoi.string().optional(),
      gAId: extendedJoi.string().optional(),
      source: extendedJoi.string().optional(),
      campaign: extendedJoi.string().optional(),
      term: extendedJoi.string().optional(),
      medium: extendedJoi.string().optional(),
      userIP: extendedJoi.string().optional(),
      device: extendedJoi.string().optional(),
      gclId: extendedJoi.string().optional(),
    }).allow(null),
  }),
});

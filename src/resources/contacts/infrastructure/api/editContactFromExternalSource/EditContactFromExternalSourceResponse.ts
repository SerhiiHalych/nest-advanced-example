import { ApiProperty } from '@nestjs/swagger';

import { AcquisitionChannel } from '../../../application/enum/AcquisitionChannel';
import { CommunicationPreference } from '../../../application/enum/CommunicationPreference';

class EditContactResponseAcquisitionData {
  @ApiProperty()
  signUpLink: string;

  @ApiProperty()
  acquisitionChannel: string;

  @ApiProperty()
  foobarId: string;

  @ApiProperty()
  stytchId: string;

  @ApiProperty()
  referredBy: string;

  @ApiProperty()
  gAId: string;

  @ApiProperty()
  source: string;

  @ApiProperty()
  campaign: string;

  @ApiProperty()
  term: string;

  @ApiProperty()
  medium: string;

  @ApiProperty()
  userIP: string;

  @ApiProperty()
  device: string;

  @ApiProperty()
  gclId: string;
}

export class EditContactFromExternalSourceResponse {
  @ApiProperty()
  id: string;

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

  @ApiProperty({ nullable: true, enum: AcquisitionChannel })
  cameFrom: AcquisitionChannel | null;

  @ApiProperty({ type: EditContactResponseAcquisitionData, nullable: true })
  acquisitionData: EditContactResponseAcquisitionData | null;

  @ApiProperty({ nullable: true })
  externalId: string | null;
}

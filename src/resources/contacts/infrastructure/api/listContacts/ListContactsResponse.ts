import { ApiProperty } from '@nestjs/swagger';

class ItemSummaryResponse {
  @ApiProperty()
  activeCampaigns: number;

  @ApiProperty()
  activeTourInquires: number;

  @ApiProperty()
  activeApplyInquires: number;
}

class ListContactsResponseOwnerUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  givenName: string;

  @ApiProperty({ nullable: true })
  familyName: string | null;

  @ApiProperty()
  picture: string;
}

class ListContactsResponseOwner {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: ListContactsResponseOwnerUser })
  user: ListContactsResponseOwnerUser;
}

class ListContactsResponseItem {
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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ListContactsResponseOwner, nullable: true })
  owner: ListContactsResponseOwner | null;
}

class ListContactsResponseMeta {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  currentPage: number;
}

export class ListContactsResponse {
  @ApiProperty({ type: [ListContactsResponseItem] })
  items: Array<ListContactsResponseItem>;

  @ApiProperty({ type: ListContactsResponseMeta })
  meta: ListContactsResponseMeta;
}

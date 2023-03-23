import { ApiProperty } from '@nestjs/swagger';

class CreateNewContactResponseUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  givenName: string;

  @ApiProperty({ nullable: true })
  familyName: string | null;

  @ApiProperty()
  picture: string;
}

class CreateNewContactResponseOwner {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: CreateNewContactResponseUser })
  user: CreateNewContactResponseUser;
}

export class CreateNewContactResponse {
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

  @ApiProperty({ type: CreateNewContactResponseOwner })
  owner: CreateNewContactResponseOwner;
}

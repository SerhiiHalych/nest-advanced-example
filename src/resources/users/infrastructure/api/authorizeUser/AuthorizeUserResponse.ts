import { ApiProperty } from '@nestjs/swagger';

import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';

class AuthorizeUserResponseUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  givenName: string;

  @ApiProperty({ nullable: true })
  familyName: string | null;

  @ApiProperty()
  picture: string;
}

class AuthorizeUserResponseEmployee {
  @ApiProperty()
  id: string;

  @ApiProperty({ isArray: true, enum: EmployeeRole })
  roles: EmployeeRole[];
}

export class AuthorizeUserResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AuthorizeUserResponseUser })
  user: AuthorizeUserResponseUser;

  @ApiProperty({ type: AuthorizeUserResponseEmployee })
  employee: AuthorizeUserResponseEmployee;
}

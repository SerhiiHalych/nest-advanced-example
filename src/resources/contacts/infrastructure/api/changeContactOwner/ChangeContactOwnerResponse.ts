import { ApiProperty } from '@nestjs/swagger';

import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';

class ChangeContactOwnerResponseOwnerUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  givenName: string;

  @ApiProperty({ nullable: true })
  familyName: string | null;

  @ApiProperty()
  picture: string;
}

class ChangeContactOwnerResponseOwner {
  @ApiProperty()
  id: string;

  @ApiProperty({ isArray: true, enum: EmployeeRole })
  roles: EmployeeRole[];

  @ApiProperty({ type: ChangeContactOwnerResponseOwnerUser })
  user: ChangeContactOwnerResponseOwnerUser;
}

class ChangeContactOwnerResponseAssigneeUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  givenName: string;

  @ApiProperty({ nullable: true })
  familyName: string | null;

  @ApiProperty()
  picture: string;
}

class ChangeContactOwnerResponseAssignee {
  @ApiProperty()
  id: string;

  @ApiProperty({ isArray: true, enum: EmployeeRole })
  roles: EmployeeRole[];

  @ApiProperty({ type: ChangeContactOwnerResponseAssigneeUser })
  user: ChangeContactOwnerResponseAssigneeUser;
}

export class ChangeContactOwnerResponse {
  @ApiProperty({ type: ChangeContactOwnerResponseAssignee, nullable: true })
  assignee: ChangeContactOwnerResponseAssignee | null;

  @ApiProperty({ type: ChangeContactOwnerResponseOwner, nullable: true })
  owner: ChangeContactOwnerResponseOwner | null;
}

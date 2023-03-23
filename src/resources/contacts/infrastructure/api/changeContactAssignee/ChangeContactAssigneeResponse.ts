import { ApiProperty } from '@nestjs/swagger';

import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';

class ChangeContactAssigneeResponseAssigneeUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  givenName: string;

  @ApiProperty({ nullable: true })
  familyName: string | null;

  @ApiProperty()
  picture: string;
}

class ChangeContactAssigneeResponseAssignee {
  @ApiProperty()
  id: string;

  @ApiProperty({ isArray: true, enum: EmployeeRole })
  roles: EmployeeRole[];

  @ApiProperty({ type: ChangeContactAssigneeResponseAssigneeUser })
  user: ChangeContactAssigneeResponseAssigneeUser;
}

export class ChangeContactAssigneeResponse {
  @ApiProperty({ type: ChangeContactAssigneeResponseAssignee, nullable: true })
  assignee: ChangeContactAssigneeResponseAssignee | null;
}

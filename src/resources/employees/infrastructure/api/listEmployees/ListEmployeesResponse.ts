import { ApiProperty } from '@nestjs/swagger';

import { EmployeeRole } from '../../../application/enums/EmployeeRole';

class ListEmployeesResponseUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  givenName: string;

  @ApiProperty({ nullable: true })
  familyName: string | null;

  @ApiProperty()
  picture: string;
}

class ListEmployeesResponseItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  team: string;

  @ApiProperty({ isArray: true, enum: EmployeeRole })
  roles: EmployeeRole[];

  @ApiProperty({ type: ListEmployeesResponseUser })
  user: ListEmployeesResponseUser;

  @ApiProperty()
  createdAt: Date;
}

class ListEmployeesResponseMeta {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  currentPage: number;
}

export class ListEmployeesResponse {
  @ApiProperty({ type: [ListEmployeesResponseItem] })
  items: ListEmployeesResponseItem[];

  @ApiProperty({ type: ListEmployeesResponseMeta })
  meta: ListEmployeesResponseMeta;
}

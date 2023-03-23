import { ApiProperty } from '@nestjs/swagger';

import { EmployeeRole } from '../../../application/enums/EmployeeRole';

class ListAvailableAssigneesResponseUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  givenName: string;

  @ApiProperty({ nullable: true })
  familyName: string | null;

  @ApiProperty()
  picture: string;
}

class ListAvailableAssigneesResponseItem {
  @ApiProperty()
  id: string;

  @ApiProperty({ isArray: true, enum: EmployeeRole })
  roles: EmployeeRole[];

  @ApiProperty({ type: ListAvailableAssigneesResponseUser })
  user: ListAvailableAssigneesResponseUser;
}

export class ListAvailableAssigneesResponse {
  @ApiProperty({ type: [ListAvailableAssigneesResponseItem] })
  items: ListAvailableAssigneesResponseItem[];
}

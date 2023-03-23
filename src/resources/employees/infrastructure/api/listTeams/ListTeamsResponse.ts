import { ApiProperty } from '@nestjs/swagger';

import { EmployeeRole } from '../../../application/enums/EmployeeRole';

class ListTeamsResponseItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: EmployeeRole })
  role: EmployeeRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ListTeamsResponse {
  @ApiProperty({ type: [ListTeamsResponseItem] })
  items: Array<ListTeamsResponseItem>;
}

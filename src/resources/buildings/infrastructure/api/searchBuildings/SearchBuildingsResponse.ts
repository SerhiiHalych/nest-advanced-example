import { ApiProperty } from '@nestjs/swagger';

class SearchBuildingsResponseItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;
}

export class SearchBuildingsResponse {
  @ApiProperty({ type: [SearchBuildingsResponseItem] })
  items: Array<SearchBuildingsResponseItem>;
}

import { Controller, Get, Inject, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { QueryHandlerType } from '../../../../common/diTokens';
import { JwtAuthGuard } from '../../../../common/infrastructure/api/guards/jwt-auth.guard';
import { validateRequest } from '../../../../common/infrastructure/validation/joi/validateRequest';
import { ISearchBuildingsQueryHandler } from '../../application/queries/searchBuildings/ISearchBuildingsQueryHandler';
import { searchBuildingsRequestSchema } from './searchBuildings/SearchBuildingsRequest';
import { SearchBuildingsResponse } from './searchBuildings/SearchBuildingsResponse';

@ApiTags('Building')
@ApiBearerAuth('access-token')
@Controller({
  path: 'buildings',
})
export class BuildingController {
  constructor(
    @Inject(QueryHandlerType.SEARCH_BUILDINGS)
    private searchBuildingsQueryHandler: ISearchBuildingsQueryHandler
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SearchBuildingsResponse })
  @Get()
  @UseInterceptors(validateRequest(searchBuildingsRequestSchema))
  async searchRemote(@Query('search') search: string): Promise<SearchBuildingsResponse> {
    const result = await this.searchBuildingsQueryHandler.execute({
      search,
    });

    return {
      items: result.items.map(item => ({
        address: item.address,
        city: item.city,
        id: item.id,
        name: item.name,
      })),
    };
  }
}

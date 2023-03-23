import { Module } from '@nestjs/common';

import { ProviderType, QueryHandlerType } from '../../common/diTokens';
import { SearchBuildingsQueryHandler } from './application/queries/searchBuildings/SearchBuildingsQueryHandler';
import { BuildingController } from './infrastructure/api/BuildingController';
import { FoobarBuildingProvider } from './infrastructure/providers/FoobarBuildingProvider';

@Module({
  controllers: [BuildingController],
  providers: [
    // Queries
    {
      provide: QueryHandlerType.SEARCH_BUILDINGS,
      useClass: SearchBuildingsQueryHandler,
    },

    // Providers
    {
      provide: ProviderType.EXTERNAL_BUILDING_PROVIDER,
      useClass: FoobarBuildingProvider,
    },
  ],
})
export class BuildingsModule {}

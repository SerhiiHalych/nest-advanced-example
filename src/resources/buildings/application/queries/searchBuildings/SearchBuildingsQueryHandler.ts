import { Inject, Injectable, Scope } from '@nestjs/common';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import { ProviderType } from '../../../../../common/diTokens';
import { IExternalBuildingProvider } from '../../boundaries/IExternalBuildingProvider';
import type { ISearchBuildingsQueryHandler } from './ISearchBuildingsQueryHandler';
import type { SearchBuildingsQueryInput } from './SearchBuildingsQueryInput';
import type { SearchBuildingsQueryResult } from './SearchBuildingsQueryResult';

@Injectable({ scope: Scope.REQUEST })
export class SearchBuildingsQueryHandler
  extends AbstractQueryHandler<SearchBuildingsQueryInput, SearchBuildingsQueryResult>
  implements ISearchBuildingsQueryHandler
{
  constructor(
    @Inject(ProviderType.EXTERNAL_BUILDING_PROVIDER) private externalBuildingProvider: IExternalBuildingProvider
  ) {
    super();
  }

  protected async implementation(input: SearchBuildingsQueryInput): Promise<SearchBuildingsQueryResult> {
    const { search } = input;

    const buildings = await this.externalBuildingProvider.searchBuildings({ search });

    return {
      items: buildings.map(building => ({
        address: building.address,
        city: building.city,
        id: building.id,
        name: building.name,
      })),
    };
  }
}

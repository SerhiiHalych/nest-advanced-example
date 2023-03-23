import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';

import { ApplicationError } from '../../../../app/errors/application.error';
import type { IExternalBuildingProvider } from '../../application/boundaries/IExternalBuildingProvider';
import type { ExternalBuildingDto } from '../../application/dataStructures/ExternalBuildingDto';
import type { GetExternalBuildingByIdResponse } from './GetExternalBuildingByIdResponse';
import type { ListBuildingsByPropertyIdsResponse } from './ListBuildingsByPropertyIdsResponse';
import type { SearchBuildingsResponse } from './SearchBuildingsResponse';

@Injectable()
export class FoobarBuildingProvider implements IExternalBuildingProvider {
  async getBuildingByExternalId(externalId: string): Promise<ExternalBuildingDto> {
    try {
      const httpService = new HttpService();

      const foobarBuildingProviderUrl = `${process.env.LIGHTHOUSE_CORE_API_URL}/v1/properties`;

      const { data } = await firstValueFrom(
        httpService.get<GetExternalBuildingByIdResponse>(`${foobarBuildingProviderUrl}/${externalId}`, {
          responseType: 'json',
        })
      );

      return {
        maxRent: data.maxRent ?? _(data.floorplans).maxBy(({ maxRent }) => maxRent)?.maxRent ?? 0,
        photo: (data.propertyPhotos && data.propertyPhotos[0]?.url) ?? null,
        address: data.address,
        cashback: data.cashback,
        city: data.city,
        email: data.email,
        floorPlans: data.floorplans,
        id: data.id,
        minRent: data.minRent,
        name: data.name,
        phone: data.phone,
        state: data.state,
        website: data.website,
        zip: +data.zip,
      };
    } catch (error) {
      throw new ApplicationError('Building not found');
    }
  }

  async listBuildingsByPropertyIds(propertyIds: string[]): Promise<ExternalBuildingDto[]> {
    if (propertyIds.length === 0) {
      return [];
    }

    try {
      const httpService = new HttpService();

      const externalIdsSearchParams = propertyIds.map(propertyId => `externalIds=${propertyId}`).join('&');

      const foobarBuildingProviderUrl = `${process.env.LIGHTHOUSE_CORE_API_URL}/v1/property-data?${externalIdsSearchParams}`;

      const { data } = await firstValueFrom(
        httpService.get<ListBuildingsByPropertyIdsResponse>(foobarBuildingProviderUrl, {
          responseType: 'json',
        })
      );

      return data.map(property => ({
        maxRent:
          property.overview.maxRent ??
          _(property.floorplans).maxBy(({ rentRange }) => rentRange[1].value)?.rentRange[1].value ??
          0,
        photo: (property.photos && property.photos[0]?.url) ?? null,
        address: property.overview.address,
        cashback: property.overview.cashback,
        city: property.overview.city,
        email: property.overview.email,
        floorPlans: property.floorplans.map(floorplan => ({
          bathroomCount: floorplan.bathroomCount,
          minRent: floorplan.rentRange[0].value,
          maxRent: floorplan.rentRange[1].value,
          deposit: floorplan.deposit,
          name: floorplan.name,
          bedroomCount: floorplan.bedroomCount,
          sqftAvg: floorplan.sqftAvg,
          availability: floorplan.availability,
          unitsAvailable: floorplan.unitsAvailable,
          unitsCount: floorplan.unitsCount,
        })),
        id: property.id,
        minRent: property.overview.minRent,
        name: property.overview.name,
        phone: property.overview.phone,
        state: property.overview.state,
        website: property.overview.website,
        zip: +property.overview.zip,
      }));
    } catch (error) {
      throw new ApplicationError('Building not found');
    }
  }

  async searchBuildings(params: { search: string }): Promise<
    Array<{
      id: string;
      name: string;
      address: string;
      city: string;
    }>
  > {
    const { search } = params;

    const httpService = new HttpService();

    const foobarBuildingProviderUrl = `${process.env.LIGHTHOUSE_CORE_API_URL}/v1/properties`;

    const [{ data: dataByName }, { data: dataByAddress }] = await Promise.all([
      firstValueFrom(
        httpService.get<SearchBuildingsResponse>(`${foobarBuildingProviderUrl}/search`, {
          responseType: 'json',
          params: {
            name: search,
            fields: 'id,address,name,city',
          },
        })
      ),

      firstValueFrom(
        httpService.get<SearchBuildingsResponse>(`${foobarBuildingProviderUrl}/search`, {
          responseType: 'json',
          params: {
            address: search,
            fields: 'id,address,name,city',
          },
        })
      ),
    ]);

    const buildingsToReturn = _([...dataByName.properties, ...dataByAddress.properties])
      .uniqBy(({ id }) => id)
      .value();

    return buildingsToReturn.map(building => ({
      address: building.address,
      city: building.city,
      id: building.id,
      name: building.name,
    }));
  }
}

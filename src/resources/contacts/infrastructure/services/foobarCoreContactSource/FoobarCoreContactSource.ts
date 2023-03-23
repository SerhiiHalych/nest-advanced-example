import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from 'jsonwebtoken';
import * as moment from 'moment-timezone';
import { firstValueFrom } from 'rxjs';

import { ApplicationError } from '../../../../../app/errors/application.error';
import type { IContactExternalSource } from '../../../application/boundaries/IContactExternalSource';
import type { ContactCreateDto } from '../../../application/dataStructures/ContactCreateDto';
import type { ContactDto } from '../../../application/dataStructures/ContactDto';
import type { FoobarCoreContactCreateRequest } from './typings/FoobarCoreContactCreateRequest';
import type { FoobarCoreContactCreateResponse } from './typings/FoobarCoreContactCreateResponse';
import type { FoobarCoreContactUpdateRequest } from './typings/FoobarCoreContactUpdateRequest';
import type { FoobarCoreContactUpdateResponse } from './typings/FoobarCoreContactUpdateResponse';

export class FoobarCoreContactSource implements IContactExternalSource {
  async create(data: ContactCreateDto): Promise<{
    externalId: string;
    stytchId: string;
    givenName: string | null;
    familyName: string | null;
    email: string | null;
    referredBy: string | null;
    referralCode: string;
    emailVerified: boolean;
    phoneNumber: string | null;
    phoneVerified: boolean;
  }> {
    try {
      const httpService = new HttpService();

      const body: FoobarCoreContactCreateRequest = {
        email: data.email ?? undefined,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        phoneNumber: data.phone ?? undefined,
      };

      const foobarBuildingProviderUrl = `${process.env.LIGHTHOUSE_CORE_API_URL}/integration/v1/users`;

      const { data: response } = await firstValueFrom(
        httpService.post<FoobarCoreContactCreateResponse>(foobarBuildingProviderUrl, body, {
          responseType: 'json',
          headers: {
            Authorization: `Bearer ${this.generateToken()}`,
          },
        })
      );

      return {
        email: response.data.email,
        emailVerified: response.data.emailVerified,
        familyName: response.data.familyName,
        givenName: response.data.givenName,
        externalId: response.data.id,
        phoneNumber: response.data.phoneNumber,
        phoneVerified: response.data.phoneVerified,
        referralCode: response.data.referralCode,
        referredBy: response.data.referredBy,
        stytchId: response.data.stytchId,
      };
    } catch (error) {
      throw new ApplicationError('Can not create contact in Foobar API');
    }
  }

  async update(
    externalId: string,
    data: ContactDto
  ): Promise<{
    externalId: string;
    stytchId: string;
    givenName: string | null;
    familyName: string | null;
    email: string | null;
    referredBy: string | null;
    referralCode: string;
    emailVerified: boolean;
    phoneNumber: string | null;
    phoneVerified: boolean;
  }> {
    try {
      const httpService = new HttpService();

      const body: FoobarCoreContactUpdateRequest = {
        email: data.email ?? undefined,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        phoneNumber: data.phone ?? undefined,
      };

      const foobarBuildingProviderUrl = `${process.env.LIGHTHOUSE_CORE_API_URL}/integration/v1/users/${externalId}`;

      const { data: response } = await firstValueFrom(
        httpService.patch<FoobarCoreContactUpdateResponse>(foobarBuildingProviderUrl, body, {
          responseType: 'json',
          headers: {
            Authorization: `Bearer ${this.generateToken()}`,
          },
        })
      );

      return {
        email: response.data.email,
        emailVerified: response.data.emailVerified,
        familyName: response.data.familyName,
        givenName: response.data.givenName,
        externalId: response.data.id,
        phoneNumber: response.data.phoneNumber,
        phoneVerified: response.data.phoneVerified,
        referralCode: response.data.referralCode,
        referredBy: response.data.referredBy,
        stytchId: response.data.stytchId,
      };
    } catch (error) {
      throw new ApplicationError('Can not update contact in Foobar API');
    }
  }

  private generateToken(): string {
    const jwt = new JwtService({ secret: process.env.JWT_INTEGRATION_SECRET });

    const expirationDatetime = moment().tz('America/New_York');

    expirationDatetime.add(1, 'minutes');

    const payload: JwtPayload = {
      iss: 'Foobar CRM',
      exp: expirationDatetime.unix(),
      iat: moment().tz('America/New_York').unix(),
    };

    return jwt.sign(payload);
  }
}

import { Inject, Injectable, Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from 'jsonwebtoken';
import * as moment from 'moment-timezone';

import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType, ServiceType } from '../../../../../common/diTokens';
import { getOrDefault } from '../../../../../common/utils/getOrDefault';
import type { EmployeeCreateDto } from '../../../../employees/application/dataStructures/EmployeeCreateDto';
import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';
import type { UserCreateDto } from '../../dataStructures/UserCreateDto';
import type { UserDto } from '../../dataStructures/UserDto';
import type { UserUpdateDto } from '../../dataStructures/UserUpdateDto';
import { IAuthService } from '../../services/authService/IAuthService';
import type { AuthorizeUserCommandInput } from './AuthorizeUserCommandInput';
import type { AuthorizeUserCommandResult } from './AuthorizeUserCommandResult';
import type { IAuthorizeUserCommandHandler } from './IAuthorizeUserCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class AuthorizeUserCommandHandler
  extends AbstractCommandHandler<AuthorizeUserCommandInput, AuthorizeUserCommandResult>
  implements IAuthorizeUserCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(@Inject(ServiceType.AUTH_SERVICE) private authService: IAuthService) {
    super();
  }

  protected async implementation(input: AuthorizeUserCommandInput): Promise<AuthorizeUserCommandResult> {
    const { oauthToken } = input;

    const identity = await this.authService.authenticate(oauthToken);

    let user = await this._dbContext.userRepository.findByExternalId(identity.externalId);

    if (!user) {
      const userToCreate: UserCreateDto = {
        email: identity.email,
        externalId: identity.externalId,
        givenName: identity.givenName,
        isActive: true,
        picture: identity.picture,
        familyName: identity.familyName,
      };

      user = await this._dbContext.userRepository.create(userToCreate);
    } else {
      const userToUpdate: UserUpdateDto = {
        id: user.id,
        isActive: user.isActive,
        email: getOrDefault(identity.email, user.email),
        externalId: getOrDefault(identity.externalId, user.externalId),
        givenName: getOrDefault(identity.givenName, user.givenName),
        picture: getOrDefault(identity.picture, user.picture),
        familyName: getOrDefault(identity.familyName, user.familyName),
      };

      await this._dbContext.userRepository.update(userToUpdate);

      user = (await this._dbContext.userRepository.findById(user.id)) as UserDto;
    }

    let employee = await this._dbContext.employeeRepository.findByUserId(user.id);

    if (!employee) {
      const employeeToSave: EmployeeCreateDto = {
        isAvailable: true,
        isArchived: false,
        roles: [EmployeeRole.COLLABORATORS],
        userId: user.id,
        teamId: null,
      };

      employee = await this._dbContext.employeeRepository.create(employeeToSave);
    }

    const expirationDatetime = moment().tz('America/New_York');

    if (expirationDatetime.get('hours') >= 4) {
      expirationDatetime.add(1, 'days');
    }

    expirationDatetime.startOf('day');
    expirationDatetime.hours(4);

    const payload: JwtPayload = {
      iss: 'Foobar CRM',
      sub: user.id,
      exp: expirationDatetime.unix(),
      iat: moment().tz('America/New_York').unix(),
    };

    const jwt = new JwtService({ secret: process.env.JWT_SECRET });

    const token = jwt.sign(payload);

    return {
      accessToken: token,
      employee: {
        id: employee.id,
        roles: employee.roles,
      },
      user: {
        givenName: user.givenName,
        id: user.id,
        picture: user.picture,
        familyName: user.familyName,
      },
    };
  }
}

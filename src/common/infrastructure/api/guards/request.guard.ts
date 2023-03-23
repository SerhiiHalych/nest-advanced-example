import type { CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { Injectable, mixin } from '@nestjs/common';

import type { EmployeeRole } from '../../../../resources/employees/application/enums/EmployeeRole';
import type { RequestExtended } from '../RequestExtended';

export const RequestGuard = (rolesToCheck: EmployeeRole[]): Type<CanActivate> => {
  @Injectable()
  class RequestGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      // const {
      //   user: { roles },
      // } = context.switchToHttp().getRequest<RequestExtended>();

      // return roles.every(role => rolesToCheck.includes(role));

      return true;
    }
  }

  return mixin(RequestGuard);
};

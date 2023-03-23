import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IncomingMessage } from 'http';
import type { JwtPayload } from 'jsonwebtoken';

import { EmployeeRole } from '../../../../resources/employees/application/enums/EmployeeRole';
import { IdentityType } from '../../../application/identity/DSIdentity';
import type { RequestExtended } from '../RequestExtended';

@Injectable()
export class IntegrationJwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestExtended>();

    const jwtToken = this.parseTokenFromHeaders(req);

    try {
      const jwt = new JwtService({ secret: process.env.JWT_INTEGRATION_SECRET });

      const payload = jwt.verify<JwtPayload>(jwtToken);

      req.user = {
        id: payload.iss,
        employeeId: null,
        roles: [
          EmployeeRole.DISPATCHERS,
          EmployeeRole.ADMINISTRATORS,
          EmployeeRole.COLLABORATORS,
          EmployeeRole.LIGHTKEEPERS,
          EmployeeRole.SEARCHLIGHTS,
        ],
        type: IdentityType.ROBOT,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  private parseTokenFromHeaders(req: IncomingMessage): string {
    const [, jwtToken] = req.headers.authorization?.split(' ') || [];

    return jwtToken;
  }
}

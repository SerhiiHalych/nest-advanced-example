import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IncomingMessage } from 'http';
import type { JwtPayload } from 'jsonwebtoken';

import type { EmployeeDto } from '../../../../resources/employees/application/dataStructures/EmployeeDto';
import { IdentityType } from '../../../application/identity/DSIdentity';
import { IGlobalReadDBContext } from '../../../application/IGlobalReadDBContext';
import { BaseType } from '../../../diTokens';
import type { RequestExtended } from '../RequestExtended';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(BaseType.GLOBAL_READ_DB_CONTEXT) private dbContext: IGlobalReadDBContext) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestExtended>();

    const jwtToken = this.parseTokenFromHeaders(req);

    try {
      const jwt = new JwtService({ secret: process.env.JWT_SECRET });

      const decodedData = jwt.verify<JwtPayload>(jwtToken);

      const user = await this.dbContext.userRepository.findById(decodedData.sub);

      if (!user) {
        throw new UnauthorizedException();
      }

      const employee = (await this.dbContext.employeeRepository.findByUserId(user.id)) as EmployeeDto;

      req.user = {
        id: user.id,
        employeeId: employee.id,
        roles: employee.roles,
        type: IdentityType.USER,
      };

      return true;
    } catch (err) {
      console.log(err);

      throw new UnauthorizedException();
    }
  }

  private parseTokenFromHeaders(req: IncomingMessage): string {
    const [, jwtToken] = req.headers.authorization?.split(' ') || [];

    return jwtToken;
  }
}

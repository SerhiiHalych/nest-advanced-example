import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import type { JwtPayload } from 'jsonwebtoken';
import type { Socket } from 'socket.io';

import type { EmployeeDto } from '../../../../resources/employees/application/dataStructures/EmployeeDto';
import { IGlobalReadDBContext } from '../../../application/IGlobalReadDBContext';
import { BaseType } from '../../../diTokens';

export type AuthorizedSocket = Socket & { employeeId: string };

@Injectable()
export class GatewayJwtAuthGuard implements CanActivate {
  constructor(@Inject(BaseType.GLOBAL_READ_DB_CONTEXT) private dbContext: IGlobalReadDBContext) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient<Socket>();

    const jwtToken = socket.handshake.headers.authorization.split(' ')[1];

    try {
      const jwt = new JwtService({ secret: process.env.JWT_SECRET });

      const decodedData = jwt.verify<JwtPayload>(jwtToken);

      const user = await this.dbContext.userRepository.findById(decodedData.sub);

      if (!user) {
        throw new WsException('Unauthorized');
      }

      const employee = (await this.dbContext.employeeRepository.findByUserId(user.id)) as EmployeeDto;

      Object.assign(socket, {
        employeeId: employee.id,
      });

      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}

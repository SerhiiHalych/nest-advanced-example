import { UseFilters, UseGuards } from '@nestjs/common';
import type { OnGatewayDisconnect } from '@nestjs/websockets';
import { ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
import { WebSocketGateway } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

import { WebsocketExceptionsFilter } from '../../common/infrastructure/api/filters/WebsocketExceptionsFilter';
import { AuthorizedSocket, GatewayJwtAuthGuard } from '../../common/infrastructure/api/guards/gateway-jwt-auth.guard';
import { EmployeeRolesObserver } from './EmployeeRolesObserver';

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway({ namespace: 'employee' })
export class EmployeeRolesGateway implements OnGatewayDisconnect {
  constructor(private employeeObserver: EmployeeRolesObserver) {}

  @UseGuards(GatewayJwtAuthGuard)
  @SubscribeMessage('roles-changed')
  listenForMessages(@ConnectedSocket() socket: AuthorizedSocket): void {
    this.employeeObserver.subscribe(socket.id, ({ employeeId, newRoles }) => {
      if (socket.employeeId !== employeeId) {
        return;
      }

      socket.emit(
        'new-roles',
        newRoles.map(e => e)
      );
    });
  }

  handleDisconnect(client: Socket): any {
    this.employeeObserver.unsubscribe(client.id);
  }
}

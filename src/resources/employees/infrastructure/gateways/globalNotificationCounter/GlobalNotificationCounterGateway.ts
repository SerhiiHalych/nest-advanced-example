/* eslint-disable no-console */
import { Inject, UseFilters, UseGuards } from '@nestjs/common';
import type { OnGatewayDisconnect } from '@nestjs/websockets';
import { ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
import { WebSocketGateway } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

import { IGlobalReadDBContext } from '../../../../../common/application/IGlobalReadDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { WebsocketExceptionsFilter } from '../../../../../common/infrastructure/api/filters/WebsocketExceptionsFilter';
import {
  AuthorizedSocket,
  GatewayJwtAuthGuard,
} from '../../../../../common/infrastructure/api/guards/gateway-jwt-auth.guard';
import { BuildingChatAcknowledgementObserver } from '../../../../communications/application/observers/BuildingChatAcknowledgementObserver';
import { BuildingChatObserver } from '../../../../communications/application/observers/BuildingChatObserver';
import { CommunicationAcknowledgementObserver } from '../../../../communications/application/observers/CommunicationAcknowledgementObserver';
import { CommunicationObserver } from '../../../../communications/application/observers/CommunicationObserver';

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway({
  namespace: 'global-notifications',
})
export class GlobalNotificationCounterGateway implements OnGatewayDisconnect {
  constructor(
    private communicationObserver: CommunicationObserver,
    private communicationAcknowledgementObserver: CommunicationAcknowledgementObserver,
    private buildingChatAcknowledgementObserver: BuildingChatAcknowledgementObserver,
    private buildingChatObserver: BuildingChatObserver,
    @Inject(BaseType.GLOBAL_READ_DB_CONTEXT) private globalReadDbContext: IGlobalReadDBContext
  ) {}

  @UseGuards(GatewayJwtAuthGuard)
  @SubscribeMessage('stream')
  async listenForMessages(@ConnectedSocket() socket: AuthorizedSocket): Promise<void> {
    this.communicationObserver.subscribe(socket.id, async ({ communicationItem }) => {
      try {
        if (communicationItem.acknowledgement.some(({ employeeId }) => employeeId === socket.employeeId)) {
          await this.sendGlobalCountersUpdate(socket);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    this.buildingChatObserver.subscribe(socket.id, async ({ buildingChatItem }) => {
      try {
        if (buildingChatItem.acknowledgement.some(({ employeeId }) => employeeId === socket.employeeId)) {
          await this.sendGlobalCountersUpdate(socket);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    this.communicationAcknowledgementObserver.subscribe(socket.id, async ({ employeeId }) => {
      if (employeeId !== socket.employeeId) {
        return;
      }

      try {
        await this.sendGlobalCountersUpdate(socket);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    this.buildingChatAcknowledgementObserver.subscribe(socket.id, async ({ employeeId }) => {
      if (employeeId !== socket.employeeId) {
        return;
      }

      try {
        await this.sendGlobalCountersUpdate(socket);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });
  }

  handleDisconnect(client: Socket): any {
    this.communicationObserver.unsubscribe(client.id);
    this.buildingChatObserver.unsubscribe(client.id);
    this.communicationAcknowledgementObserver.unsubscribe(client.id);
    this.buildingChatAcknowledgementObserver.unsubscribe(client.id);
  }

  private async sendGlobalCountersUpdate(socket: AuthorizedSocket): Promise<void> {
    const globalNotificationsCount = await this.getGlobalNotificationsCount(socket.employeeId);

    socket.emit('global-counter-updated', {
      notificationCount: globalNotificationsCount,
    });
  }

  private async getGlobalNotificationsCount(employeeId: string): Promise<number> {
    const unacknowledgedCommunicationItemsCount =
      await this.globalReadDbContext.communicationRepository.countUnacknowledgedItemsForEmployee(employeeId);

    const unacknowledgedBuildingChatItemsCount =
      await this.globalReadDbContext.buildingChatRepository.countUnacknowledgedItemsForEmployee(employeeId);

    return unacknowledgedCommunicationItemsCount + unacknowledgedBuildingChatItemsCount;
  }
}

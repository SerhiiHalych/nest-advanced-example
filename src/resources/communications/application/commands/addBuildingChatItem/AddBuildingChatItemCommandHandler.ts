/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import type { ContactDto } from '../../../../contacts/application/dataStructures/ContactDto';
import type { EmployeeDto } from '../../../../employees/application/dataStructures/EmployeeDto';
import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';
// import { BuildingChatMessageConsumer } from '../../../infrastructure/services/BuildingChatMessageConsumer';
import type { BuildingChatDto } from '../../dataStructures/BuildingChatDto';
import type { BuildingChatItemDto } from '../../dataStructures/BuildingChatItemDto';
import { BuildingChatItemType } from '../../enum/BuildingChatItemType';
import { BuildingChatObserver } from '../../observers/BuildingChatObserver';
import type { IAddBuildingChatItemCommandHandler } from './IAddBuildingChatItemCommandHandler';
import type { AddBuildingChatItemCommandInput } from './АddBuildingChatItemCommandInput';
import type { AddBuildingChatItemCommandResult } from './АddBuildingChatItemCommandResult';

@Injectable({ scope: Scope.REQUEST })
export class AddBuildingChatItemCommandHandler
  extends AbstractCommandHandler<AddBuildingChatItemCommandInput, AddBuildingChatItemCommandResult>
  implements IAddBuildingChatItemCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  private _fetchedData: {
    contact: ContactDto;
    employee: EmployeeDto;
    buildingChat: BuildingChatDto;
  };

  constructor(
    private buildingChatObserver: BuildingChatObserver // private buildingChatMessageConsumer: BuildingChatMessageConsumer
  ) {
    super();
  }

  protected async implementation(input: AddBuildingChatItemCommandInput): Promise<AddBuildingChatItemCommandResult> {
    const { type } = input;

    await this.fetchData();

    const { contact /* buildingChat */ } = this._fetchedData;

    // const contactBuilding = await this._dbContext.contactBuildingRepository.findById(buildingChat.contactBuildingId);

    // const building = await this._dbContext.buildingRepository.findById(contactBuilding.buildingId);

    let newMessage: BuildingChatItemDto | null = null;

    switch (type) {
      case BuildingChatItemType.OUTGOING_MESSAGE:
        newMessage = await this.sendMessage();

        break;

      case BuildingChatItemType.PRIVATE_NOTES:
        newMessage = await this.sendPrivateMessage();

        break;
    }

    this.addCommitHandler(() => this.buildingChatObserver.dispatchBuildingChatItem(newMessage, contact.id));

    // await this.buildingChatMessageConsumer.sendMessage(building.externalId, contact.externalId, input.payload.text);

    return {
      id: newMessage.id,
    };
  }

  private async fetchData(): Promise<void> {
    const { contactId, buildingId } = this._inputData;

    const contact = await this._dbContext.contactRepository.findById(contactId);

    if (!contact) {
      throw new ApplicationError('Contact not found');
    }

    const identity = this._identityContext.getIdentity();

    const employee = await this._dbContext.employeeRepository.findByUserId(identity.id);

    const contactBuilding = await this._dbContext.contactBuildingRepository.findByContactAndBuildingId(
      contactId,
      buildingId
    );

    const buildingChat = await this._dbContext.buildingChatRepository.findByContactBuildingId(contactBuilding.id);

    this._fetchedData = {
      contact,
      employee,
      buildingChat,
    };
  }

  private async sendPrivateMessage(): Promise<BuildingChatItemDto> {
    const { payload } = this._inputData;
    const { buildingChat, employee, contact } = this._fetchedData;

    const identity = this._identityContext.getIdentity();

    const allowedRolesToSendPrivateNotes: EmployeeRole[] = [
      EmployeeRole.ADMINISTRATORS,
      EmployeeRole.DISPATCHERS,
      EmployeeRole.LIGHTKEEPERS,
      EmployeeRole.COLLABORATORS,
    ];

    if (!identity.roles.some(identityRole => allowedRolesToSendPrivateNotes.includes(identityRole))) {
      throw new ApplicationError(`You have no permissions to send this type of message.`);
    }

    // search of user ids by placeholder ${}
    const employeeIdMatches = payload.text.replace(/\s/g, '').match(/\${(.*?)}/g) || [];

    const employeeIds = _(employeeIdMatches)
      .map(id => id.replace(/[${}]/g, ''))
      .uniq()
      .value();

    const employees = await this._dbContext.employeeRepository.listByIds(employeeIds);

    if (employees.length < employeeIds.length) {
      throw new ApplicationError('Some users were not found');
    }

    const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId, ...employeeIds])
      .uniq()
      .value();

    const newMessage = await this._dbContext.buildingChatRepository.createItem({
      buildingChatId: buildingChat.id,
      payload: {
        senderId: employee.id,
        text: payload.text,
      },
      type: BuildingChatItemType.PRIVATE_NOTES,
      acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
        acknowledged: false,
        employeeId,
      })),
    });

    return newMessage;
  }

  private async sendMessage(): Promise<BuildingChatItemDto> {
    try {
      const { payload } = this._inputData;

      const { buildingChat, contact, employee } = this._fetchedData;

      const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId]).uniq().value();

      const newMessage = await this._dbContext.buildingChatRepository.createItem({
        buildingChatId: buildingChat.id,
        payload: {
          senderId: employee.id,
          text: payload.text,
        },
        type: BuildingChatItemType.OUTGOING_MESSAGE,
        acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
          acknowledged: false,
          employeeId,
        })),
      });

      return newMessage;
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }
}

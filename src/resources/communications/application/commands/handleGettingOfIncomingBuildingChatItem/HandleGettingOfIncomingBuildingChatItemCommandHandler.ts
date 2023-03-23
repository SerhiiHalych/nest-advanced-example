import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType, ProviderType } from '../../../../../common/diTokens';
import { IExternalBuildingProvider } from '../../../../buildings/application/boundaries/IExternalBuildingProvider';
import type { BuildingCreateDto } from '../../../../buildings/application/dataStructures/BuildingCreateDto';
import { BuildingSource } from '../../../../buildings/application/enum/BuildingSource';
import type { ContactBuildingCreateDto } from '../../../../contacts/application/dataStructures/ContactBuildingCreateDto';
import { BuildingChatItemType } from '../../enum/BuildingChatItemType';
import { BuildingChatObserver } from '../../observers/BuildingChatObserver';
import type { HandleGettingOfIncomingBuildingChatItemCommandInput } from './HandleGettingOfIncomingBuildingChatItemCommandInput';
import type { IHandleGettingOfIncomingBuildingChatItemCommandHandler } from './IHandleGettingOfIncomingBuildingChatItemCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class HandleGettingOfIncomingBuildingChatItemCommandHandler
  extends AbstractCommandHandler<HandleGettingOfIncomingBuildingChatItemCommandInput, void>
  implements IHandleGettingOfIncomingBuildingChatItemCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(
    private buildingChatObserver: BuildingChatObserver,
    @Inject(ProviderType.EXTERNAL_BUILDING_PROVIDER) private externalBuildingProvider: IExternalBuildingProvider
  ) {
    super();
  }

  protected async implementation(input: HandleGettingOfIncomingBuildingChatItemCommandInput): Promise<void> {
    const { text, externalBuildingId, externalContactId } = input;

    const contact = await this._dbContext.contactRepository.findByExternalId(externalContactId);

    if (!contact) {
      throw new ApplicationError('Contact with provided id does not exist');
    }

    let building = await this._dbContext.buildingRepository.findByExternalId(externalBuildingId);

    if (!building) {
      const externalBuilding = await this.externalBuildingProvider.getBuildingByExternalId(externalBuildingId);

      const buildingCreateData: BuildingCreateDto = {
        address: externalBuilding.address,
        data: {
          address: externalBuilding.address,
          cashback: externalBuilding.cashback,
          city: externalBuilding.city,
          email: externalBuilding.email,
          floorPlans: externalBuilding.floorPlans,
          id: externalBuilding.id,
          maxRent: externalBuilding.maxRent,
          minRent: externalBuilding.minRent,
          name: externalBuilding.name,
          phone: externalBuilding.phone,
          photo: externalBuilding.photo,
          state: externalBuilding.state,
          website: externalBuilding.website,
          zip: externalBuilding.zip,
        },
        externalId: externalBuildingId,
        name: externalBuilding.name,
      };

      building = await this._dbContext.buildingRepository.create(buildingCreateData);
    }

    let contactBuilding = await this._dbContext.contactBuildingRepository.findByContactAndBuildingId(
      contact.id,
      building.id
    );

    if (!contactBuilding) {
      const buildingContactCreateData: ContactBuildingCreateDto = {
        source: BuildingSource.DEFAULT,
        buildingId: building.id,
        contactId: contact.id,
        notes: null,
      };

      contactBuilding = await this._dbContext.contactBuildingRepository.create(buildingContactCreateData);
    }

    let buildingChat = await this._dbContext.buildingChatRepository.findByContactBuildingId(contactBuilding.id);

    if (!buildingChat) {
      buildingChat = await this._dbContext.buildingChatRepository.create(contactBuilding.id);
    }

    const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId]).uniq().value();

    const newMessage = await this._dbContext.buildingChatRepository.createItem({
      buildingChatId: buildingChat.id,
      payload: {
        text,
      },
      type: BuildingChatItemType.INCOMING_MESSAGE,
      acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
        acknowledged: false,
        employeeId,
      })),
    });

    this.addCommitHandler(() => this.buildingChatObserver.dispatchBuildingChatItem(newMessage, contact.id));
  }
}

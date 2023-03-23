import { Inject, Injectable, Scope } from '@nestjs/common';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import type { EditContactBuildingCommandInput } from './EditContactBuildingCommandInput';
import type { EditContactBuildingCommandResult } from './EditContactBuildingCommandResult';
import type { IEditContactBuildingCommandHandler } from './IEditContactBuildingCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class EditContactBuildingCommandHandler
  extends AbstractCommandHandler<EditContactBuildingCommandInput, EditContactBuildingCommandResult>
  implements IEditContactBuildingCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(input: EditContactBuildingCommandInput): Promise<EditContactBuildingCommandResult> {
    const { buildingId, contactId, notes } = input;

    const contactBuilding = await this._dbContext.contactBuildingRepository.findByContactAndBuildingId(
      contactId,
      buildingId
    );

    if (!contactBuilding) {
      throw new ApplicationError('Building for provided contact does not exist');
    }

    contactBuilding.notes = notes;

    await this._dbContext.contactBuildingRepository.update(contactBuilding);

    return {
      id: contactBuilding.buildingId,
      notes: contactBuilding.notes,
    };
  }
}

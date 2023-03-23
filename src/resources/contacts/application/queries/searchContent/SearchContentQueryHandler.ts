import { Injectable, Scope } from '@nestjs/common';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import type { ISearchContentQueryHandler } from './ISearchContentQueryHandler';
import type { SearchContentQueryInput } from './SearchContentQueryInput';
import type { SearchContentQueryResult } from './SearchContentQueryResult';

@Injectable({ scope: Scope.REQUEST })
export class SearchContentQueryHandler
  extends AbstractQueryHandler<SearchContentQueryInput, SearchContentQueryResult>
  implements ISearchContentQueryHandler
{
  protected async implementation(input: SearchContentQueryInput): Promise<SearchContentQueryResult> {
    const { contactId, content } = input;

    const contact = await this._dbContext.contactRepository.findById(contactId);

    if (!contact) {
      throw new ApplicationError('Contact with this id does not exist');
    }

    const communication = await this._dbContext.communicationRepository.findByContactId(contactId);

    if (!communication) {
      throw new ApplicationError('Communication with this id does not exist');
    }

    const messages = await this._dbContext.communicationRepository.findByCommunicationIdAndContent(
      communication.id,
      content
    );

    return {
      messages: messages.map(message => ({
        id: message.id,
        payload: message.payload,
        type: message.type,
      })),
    };
  }
}

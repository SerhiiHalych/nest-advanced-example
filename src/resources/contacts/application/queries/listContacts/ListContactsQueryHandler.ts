import { Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import type { IListContactsQueryHandler } from './IListContactsQueryHandler';
import type { ListContactsQueryInput } from './ListContactsQueryInput';
import type { ListContactsQueryResult } from './ListContactsQueryResult';

@Injectable({ scope: Scope.REQUEST })
export class ListContactsQueryHandler
  extends AbstractQueryHandler<ListContactsQueryInput, ListContactsQueryResult>
  implements IListContactsQueryHandler
{
  protected async implementation(input: ListContactsQueryInput): Promise<ListContactsQueryResult> {
    const { searchString, skip, take } = input;
    const ownerId = input.ownerId !== 'unassigned' ? input.ownerId : null;

    const contactIds: string[] | null = null;

    const { items, totalCount } = await this._dbContext.contactRepository.listContacts({
      ids: contactIds,
      searchString: searchString,
      ownerId,
      skip,
      take,
    });

    const ownerIds = _(items)
      .map(({ ownerId }) => ownerId)
      .filter(ownerId => !_.isNull(ownerId))
      .uniq()
      .value();

    let ownerHashMap, userHashMap;

    if (!_.isEmpty(ownerIds)) {
      const owners = await this._dbContext.employeeRepository.listByIds(ownerIds);

      const userIds = _(owners)
        .map(({ userId }) => userId)
        .uniq()
        .value();

      const users = await this._dbContext.userRepository.listByIds(userIds);

      ownerHashMap = createHashMap(owners, ({ id }) => id);
      userHashMap = createHashMap(users, ({ id }) => id);
    }

    return {
      items: await Promise.all(
        items.map(async item => {
          const owner = ownerHashMap ? ownerHashMap[item.ownerId] : null;
          const user = userHashMap && owner ? userHashMap[owner.userId] : null;

          return {
            createdAt: item.createdAt,
            email: item.email,
            firstName: item.firstName,
            id: item.id,
            lastName: item.lastName,
            owner: owner
              ? {
                  id: owner.id,
                  user: {
                    id: user.id,
                    familyName: user.familyName,
                    givenName: user.givenName,
                    picture: user.picture,
                  },
                }
              : null,
            phone: item.phone,
          };
        })
      ),
      totalCount,
    };
  }
}

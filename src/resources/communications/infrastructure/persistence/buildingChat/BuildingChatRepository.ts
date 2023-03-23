import * as _ from 'lodash';
import type { FindConditions, FindManyOptions } from 'typeorm';
import { In } from 'typeorm';
import { AbstractRepository, EntityRepository, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';

import { createHashMap } from '../../../../../common/utils/createHashMap';
import { ContactBuildingEntity } from '../../../../contacts/infrastructure/persistence/ContactBuildingEntity';
import type { IBuildingChatRepository } from '../../../application/boundaries/IBuildingChatRepository';
import type { BuildingChatDto } from '../../../application/dataStructures/BuildingChatDto';
import type { BuildingChatItemCreateDto } from '../../../application/dataStructures/BuildingChatItemCreateDto';
import type { BuildingChatItemDto } from '../../../application/dataStructures/BuildingChatItemDto';
import type { BuildingChatItemType } from '../../../application/enum/BuildingChatItemType';
import { BuildingChatEntity } from './BuildingChatEntity';
import { BuildingChatItemAcknowledgementEntity } from './buildingChatItemAcknowledgement/BuildingChatItemAcknowledgementEntity';
import { BuildingChatItemEntity } from './BuildingChatItemEntity';
import { BuildingChatMapper } from './BuildingChatMapper';

@EntityRepository(BuildingChatEntity)
export class BuildingChatRepository extends AbstractRepository<BuildingChatEntity> implements IBuildingChatRepository {
  async findByContactBuildingId(id: string): Promise<BuildingChatDto | null> {
    const buildingChatEntity = await this.repository.findOne({
      where: {
        contactBuildingId: id,
      },
    });

    if (!buildingChatEntity) {
      return null;
    }

    return BuildingChatMapper.toDto(buildingChatEntity);
  }

  async findById(id: string): Promise<BuildingChatDto | null> {
    const buildingChatEntity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!buildingChatEntity) {
      return null;
    }

    return BuildingChatMapper.toDto(buildingChatEntity);
  }

  async listByIds(ids: string[]): Promise<BuildingChatDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const buildingChatEntities = await this.repository.find({
      where: {
        id: In(ids),
      },
    });

    return buildingChatEntities.map(BuildingChatMapper.toDto);
  }

  async createItem(data: BuildingChatItemCreateDto): Promise<BuildingChatItemDto> {
    const buildingChatItemEntityToSave = BuildingChatMapper.toNewItemEntity(data);

    const savedBuildingChatItemEntity = await this.manager
      .getRepository(BuildingChatItemEntity)
      .save(buildingChatItemEntityToSave);

    const buildingChatItemEntity = await this.manager.getRepository(BuildingChatItemEntity).findOneOrFail({
      where: {
        id: savedBuildingChatItemEntity.id,
      },
    });

    return BuildingChatMapper.toItemDto(buildingChatItemEntity);
  }

  async updateItem(data: BuildingChatItemDto): Promise<void> {
    const buildingChatItemEntityToSave = BuildingChatMapper.toUpdateItemEntity(data);

    await this.manager.getRepository(BuildingChatItemEntity).save(buildingChatItemEntityToSave);
  }

  async listItemsByContactBuildingId(
    contactBuildingId: string,
    targetMessageId: string,
    acknowledgerId: string,
    direction: 'UP' | 'DOWN' | null
  ): Promise<BuildingChatItemDto[]> {
    const buildingChat = await this.repository.findOne({
      where: {
        contactBuildingId,
      },
    });

    const baseFindConditions: FindConditions<BuildingChatItemEntity> = {
      buildingChatId: buildingChat.id,
    };

    let targetMessage: BuildingChatItemEntity;

    if (!targetMessageId) {
      const firstUnreadItem = await this.manager
        .getRepository(BuildingChatItemEntity)
        .createQueryBuilder('bci')
        .leftJoinAndSelect('bci.acknowledgement', 'bcia')
        .leftJoin(BuildingChatEntity, 'bc', 'bc.id = bci."buildingChatId"')
        .where('bc."contactBuildingId" = :contactBuildingId', { contactBuildingId })
        .andWhere('bcia.acknowledged = FALSE')
        .andWhere('bcia."employeeId" = :acknowledgerId', { acknowledgerId })
        .orderBy('bci."createdAt"', 'ASC')
        .getOne();

      if (!firstUnreadItem) {
        const items = await this.manager.getRepository(BuildingChatItemEntity).find({
          where: baseFindConditions,
          order: {
            createdAt: 'DESC',
          },
          take: 20,
        });

        const resortedItems = _(items)
          .orderBy(({ createdAt }) => createdAt, 'asc')
          .value();

        return resortedItems.map(BuildingChatMapper.toItemDto);
      }

      targetMessage = firstUnreadItem;
    } else {
      targetMessage = await this.manager.getRepository(BuildingChatItemEntity).findOne({
        where: {
          id: targetMessageId,
        },
      });
    }

    let buildingChatItemsToReturn: BuildingChatItemEntity[] = [];

    const upOptions: FindManyOptions<BuildingChatItemEntity> = {
      where: {
        ...baseFindConditions,
        createdAt: LessThanOrEqual(targetMessage.createdAt),
        id: Not(targetMessage.id),
      },
      order: {
        createdAt: 'DESC',
      },
    };

    const downOptions: FindManyOptions<BuildingChatItemEntity> = {
      where: {
        ...baseFindConditions,
        createdAt: MoreThanOrEqual(targetMessage.createdAt),
        id: Not(targetMessage.id),
      },
      order: {
        createdAt: 'ASC',
      },
    };

    switch (direction) {
      case 'UP':
        buildingChatItemsToReturn = buildingChatItemsToReturn.concat(
          await this.manager.getRepository(BuildingChatItemEntity).find({
            ...upOptions,
            take: 20,
          })
        );

        break;
      case 'DOWN':
        buildingChatItemsToReturn = buildingChatItemsToReturn.concat(
          await this.manager.getRepository(BuildingChatItemEntity).find({
            ...downOptions,
            take: 20,
          })
        );

        break;

      default:
        buildingChatItemsToReturn = buildingChatItemsToReturn.concat(
          targetMessage,

          await this.manager.getRepository(BuildingChatItemEntity).find({
            ...downOptions,
            take: 19,
          })
        );

        if (buildingChatItemsToReturn.length < 20) {
          buildingChatItemsToReturn = buildingChatItemsToReturn.concat(
            await this.manager.getRepository(BuildingChatItemEntity).find({
              ...upOptions,
              take: 20 - buildingChatItemsToReturn.length,
            })
          );
        }
    }

    const resortedItems = _(buildingChatItemsToReturn)
      .orderBy(({ createdAt }) => createdAt, 'asc')
      .value();

    return resortedItems.map(BuildingChatMapper.toItemDto);
  }

  async create(contactBuildingId: string): Promise<BuildingChatDto> {
    const savedBuildingChatEntity = await this.repository.save({ contactBuildingId });

    const buildingChatEntity = await this.repository.findOneOrFail({
      where: {
        id: savedBuildingChatEntity.id,
      },
    });

    return BuildingChatMapper.toDto(buildingChatEntity);
  }

  async listBuildingChatsByContactId(contactId: string): Promise<
    Array<{
      buildingChat: BuildingChatDto;
      latestMessage: BuildingChatItemDto;
    }>
  > {
    const result: Array<{
      buildingChatId: string;
      lastBuildingChatItemId: string;
    }> = await this.manager
      .getRepository(BuildingChatItemEntity)
      .createQueryBuilder('bci')
      .distinctOn(['bc.id'])
      .select('bc.id', 'buildingChatId')
      .addSelect('bci.id', 'lastBuildingChatItemId')
      .leftJoin(BuildingChatEntity, 'bc', 'bc.id = bci."buildingChatId"')
      .leftJoin(ContactBuildingEntity, 'cb', 'cb."id" = bc."contactBuildingId"')
      .where('cb."contactId" = :contactId', { contactId })
      .orderBy('bc.id')
      .addOrderBy('bci."createdAt"', 'DESC')
      .execute();

    const itemIds = result.map(({ lastBuildingChatItemId }) => lastBuildingChatItemId);

    if (itemIds.length === 0) {
      return [];
    }

    const lastBuildingChatItems = await this.manager.getRepository(BuildingChatItemEntity).find({
      where: {
        id: In(itemIds),
      },
    });

    const buildingChatIds = result.map(({ buildingChatId }) => buildingChatId);

    const buildingChats = await this.repository.find({
      where: {
        id: In(buildingChatIds),
      },
    });

    const buildingChatHashMap = createHashMap(buildingChats, ({ id }) => id);

    return lastBuildingChatItems.map(lastMessage => ({
      buildingChat: BuildingChatMapper.toDto(buildingChatHashMap[lastMessage.buildingChatId]),
      latestMessage: BuildingChatMapper.toItemDto(lastMessage),
    }));
  }

  async countUnreadMessagesForBuildingChats(
    buildingChatIds: string[],
    acknowledgerId: string
  ): Promise<
    Array<{
      buildingChatId: string;
      unreadMessagesCount: number;
    }>
  > {
    const buildingChats: Array<{
      id: string;
      unreadMessagesCount: number;
    }> = await this.repository
      .createQueryBuilder('bc')
      .select('bc.id', 'id')
      .addSelect('COUNT(bci.id)', 'unreadMessagesCount')
      .leftJoin(BuildingChatItemEntity, 'bci', 'bci."buildingChatId" = bc.id')
      .leftJoin(BuildingChatItemAcknowledgementEntity, 'bcia', 'bcia."buildingChatItemId" = bci.id')
      .where('bc.id IN (:...buildingChatIds)', { buildingChatIds })
      .andWhere('bcia."employeeId" = :acknowledgerId', { acknowledgerId })
      .andWhere('bcia.acknowledged != TRUE')
      .groupBy('bc.id')
      .execute();

    return buildingChats.map(({ id, unreadMessagesCount }) => ({
      buildingChatId: id,
      unreadMessagesCount: +unreadMessagesCount,
    }));
  }

  async countUnacknowledgedItemsForEmployeeGrouped(employeeId: string): Promise<
    Array<{
      buildingChatItemType: BuildingChatItemType;
      unacknowledgedItemsCount: number;
    }>
  > {
    const result: Array<{
      buildingChatItemType: BuildingChatItemType;
      unacknowledgedItemsCount: number;
    }> = await this.manager
      .getRepository(BuildingChatItemEntity)
      .createQueryBuilder('bci')
      .select('bci."type"', 'buildingChatItemType')
      .addSelect('COUNT(bci.id)', 'unacknowledgedItemsCount')
      .leftJoin('bci.acknowledgement', 'bcia')
      .where('bcia."employeeId" = :employeeId', { employeeId })
      .andWhere('bcia.acknowledged = FALSE')
      .groupBy('"buildingChatItemType"')
      .execute();

    return result.map(value => ({ ...value, unacknowledgedItemsCount: +value.unacknowledgedItemsCount }));
  }

  async listUnacknowledgedItemsForEmployeeByContacts(
    employeeId: string,
    contactIds: string[]
  ): Promise<Record<string, BuildingChatItemDto[]>> {
    if (contactIds.length === 0) {
      return {};
    }

    const result: Array<{
      contactId: string;
      buildingChatItemId: string;
    }> = await this.manager
      .getRepository(BuildingChatItemEntity)
      .createQueryBuilder('bci')
      .select('cb."contactId"', 'contactId')
      .addSelect('bci.id', 'buildingChatItemId')
      .leftJoin('bci.acknowledgement', 'bcia')
      .leftJoin(BuildingChatEntity, 'bc', 'bc.id = bci."buildingChatId"')
      .leftJoin(ContactBuildingEntity, 'cb', 'cb.id = bc."contactBuildingId"')
      .where('bcia."employeeId" = :employeeId', { employeeId })
      .andWhere('cb."contactId" IN (:...contactIds)', { contactIds })
      .andWhere('bcia.acknowledged = FALSE')
      .execute();

    const itemIds = result.map(({ buildingChatItemId }) => buildingChatItemId);

    if (itemIds.length === 0) {
      return {};
    }

    const buildingChatItems = await this.manager.getRepository(BuildingChatItemEntity).find({
      where: {
        id: In(itemIds),
      },
    });

    const buildingChatItemHashMap = createHashMap(buildingChatItems, ({ id }) => id);

    return _(result)
      .groupBy(({ contactId }) => contactId)
      .mapValues(items =>
        items.map(({ buildingChatItemId }) => BuildingChatMapper.toItemDto(buildingChatItemHashMap[buildingChatItemId]))
      )
      .value();
  }

  async listUnacknowledgedItemsForEmployeeByContact(
    employeeId: string,
    contactId: string
  ): Promise<BuildingChatItemDto[]> {
    const buildingChatItems = await this.manager
      .getRepository(BuildingChatItemEntity)
      .createQueryBuilder('bci')
      .leftJoin('bci.acknowledgement', 'bcia')
      .leftJoin(BuildingChatEntity, 'bc', 'bc.id = bci."buildingChatId"')
      .leftJoin(ContactBuildingEntity, 'cb', 'cb.id = bc."contactBuildingId"')
      .where('bcia."employeeId" = :employeeId', { employeeId })
      .andWhere('cb."contactId" = :contactId', { contactId })
      .andWhere('bcia.acknowledged = FALSE')
      .getMany();

    return buildingChatItems.map(BuildingChatMapper.toItemDto);
  }

  async countUnacknowledgedItemsForEmployeeForContact(employeeId: string, contactId: string): Promise<number> {
    const result: number = await this.manager
      .getRepository(BuildingChatItemEntity)
      .createQueryBuilder('bci')
      .leftJoin('bci.acknowledgement', 'bcia')
      .leftJoin(BuildingChatEntity, 'bc', 'bc.id = bci."buildingChatId"')
      .leftJoin(ContactBuildingEntity, 'cb', 'cb.id = bc."contactBuildingId"')
      .where('bcia."employeeId" = :employeeId', { employeeId })
      .andWhere('cb."contactId" = :contactId', { contactId })
      .andWhere('bcia.acknowledged = FALSE')
      .getCount();

    return result;
  }

  async countUnacknowledgedItemsForEmployee(employeeId: string): Promise<number> {
    const result: number = await this.manager
      .getRepository(BuildingChatItemEntity)
      .createQueryBuilder('bci')
      .leftJoin('bci.acknowledgement', 'bcia')
      .leftJoin(BuildingChatEntity, 'bc', 'bc.id = bci."buildingChatId"')
      .leftJoin(ContactBuildingEntity, 'cb', 'cb.id = bc."contactBuildingId"')
      .where('bcia."employeeId" = :employeeId', { employeeId })
      .andWhere('bcia.acknowledged = FALSE')
      .getCount();

    return result;
  }

  async listLastItemByContacts(contactIds: string[]): Promise<Record<string, BuildingChatItemDto>> {
    if (contactIds.length === 0) {
      return {};
    }

    const result: Array<{
      contactId: string;
      buildingChatItemId: string;
    }> = await this.manager
      .getRepository(BuildingChatItemEntity)
      .createQueryBuilder('bci')
      .distinctOn(['cb."contactId"'])
      .select('cb."contactId"', 'contactId')
      .addSelect('bci.id', 'buildingChatItemId')
      .leftJoin(BuildingChatEntity, 'bc', 'bc.id = bci."buildingChatId"')
      .leftJoin(ContactBuildingEntity, 'cb', 'cb."id" = bc."contactBuildingId"')
      .where('cb."contactId" IN (:...contactIds)', { contactIds })
      .orderBy('cb."contactId"')
      .addOrderBy('bci."createdAt"', 'DESC')
      .execute();

    const itemIds = result.map(({ buildingChatItemId }) => buildingChatItemId);

    if (itemIds.length === 0) {
      return {};
    }

    const buildingChatItems = await this.manager.getRepository(BuildingChatItemEntity).find({
      where: {
        id: In(itemIds),
      },
    });

    const buildingChatItemHashMap = createHashMap(buildingChatItems, ({ id }) => id);

    return _(result)
      .keyBy(({ contactId }) => contactId)
      .mapValues(({ buildingChatItemId }) => BuildingChatMapper.toItemDto(buildingChatItemHashMap[buildingChatItemId]))
      .value();
  }

  async getLastItemByContact(contactId: string): Promise<BuildingChatItemDto | null> {
    const buildingChatItem = await this.manager
      .getRepository(BuildingChatItemEntity)
      .createQueryBuilder('bci')
      .leftJoinAndSelect('bci.acknowledgement', 'bcia')
      .leftJoin(BuildingChatEntity, 'bc', 'bc.id = bci."buildingChatId"')
      .leftJoin(ContactBuildingEntity, 'cb', 'cb."id" = bc."contactBuildingId"')
      .where('cb."contactId" = :contactId', { contactId })
      .orderBy('bci."createdAt"', 'DESC')
      .getOne();

    if (!buildingChatItem) {
      return null;
    }

    return BuildingChatMapper.toItemDto(buildingChatItem);
  }

  async bulkUpdateItems(data: BuildingChatItemDto[]): Promise<void> {
    const buildingChatItemEntityToSave = data.map(BuildingChatMapper.toUpdateItemEntity);

    await this.manager.getRepository(BuildingChatItemEntity).save(buildingChatItemEntityToSave);
  }

  async listItemsByIds(ids: string[]): Promise<BuildingChatItemDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const buildingChatItemEntities = await this.manager.getRepository(BuildingChatItemEntity).find({
      where: {
        id: In(ids),
      },
    });

    return buildingChatItemEntities.map(BuildingChatMapper.toItemDto);
  }
}

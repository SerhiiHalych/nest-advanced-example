import * as _ from 'lodash';
import type { FindConditions, FindManyOptions } from 'typeorm';
import { In } from 'typeorm';
import { AbstractRepository, EntityRepository, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';

import type { EventType } from '../../../../../common/application/EventType';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import { runChunksSequentially } from '../../../../../common/utils/runChunksSequentially';
import type { ICommunicationRepository } from '../../../application/boundaries/ICommunicationRepository';
import type { CommunicationDto } from '../../../application/dataStructures/CommunicationDto';
import type { CommunicationItemCreateDto } from '../../../application/dataStructures/CommunicationItemCreateDto';
import type {
  CommunicationItemDto,
  IncomingEmailCommunicationItemDto,
  IncomingSmsCommunicationItemDto,
  OutgoingEmailCommunicationItemDto,
  OutgoingSmsCommunicationItemDto,
} from '../../../application/dataStructures/CommunicationItemDto';
import type { CommunicationItemType } from '../../../application/enum/CommunicationItemType';
import { CommunicationEntity } from './CommunicationEntity';
import { CommunicationItemEntity } from './CommunicationItemEntity';
import { CommunicationMapper } from './CommunicationMapper';

@EntityRepository(CommunicationEntity)
export class CommunicationRepository
  extends AbstractRepository<CommunicationEntity>
  implements ICommunicationRepository
{
  async findByContactId(id: string): Promise<CommunicationDto | null> {
    const communicationEntity = await this.repository.findOne({
      where: {
        contactId: id,
      },
    });

    if (!communicationEntity) {
      return null;
    }

    return CommunicationMapper.toDto(communicationEntity);
  }

  async listByContactIds(ids: string[]): Promise<Record<string, string>> {
    const result: Array<{
      communication_id: string;
      contact_id: string;
    }> = await this.createQueryBuilder('c')
      .select('c.id', 'communication_id')
      .addSelect('c."contactId"', 'contact_id')
      .where('c."contactId" IN (:...ids)', { ids })
      .execute();

    return _(result)
      .keyBy(({ contact_id }) => contact_id)
      .mapValues(({ communication_id }) => communication_id)
      .value();
  }

  async findById(id: string): Promise<CommunicationDto | null> {
    const communicationEntity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!communicationEntity) {
      return null;
    }

    return CommunicationMapper.toDto(communicationEntity);
  }

  async findByCommunicationIdAndContent(communicationId: string, content: string): Promise<CommunicationItemDto[]> {
    const communicationItemEntities = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .leftJoinAndSelect('ci.acknowledgement', 'cia')
      .where(`(ci."payload"->>'text')::text ILIKE :content`, { content: `%${content}%` })
      .andWhere(`ci."communicationId" = :communicationId`, { communicationId })
      .getMany();

    return communicationItemEntities.map(CommunicationMapper.toItemDto);
  }

  async createItem(data: CommunicationItemCreateDto): Promise<CommunicationItemDto> {
    const communicationItemEntityToSave = CommunicationMapper.toNewItemEntity(data);

    const savedCommunicationItemEntity = await this.manager
      .getRepository(CommunicationItemEntity)
      .save(communicationItemEntityToSave);

    const communicationItemEntity = await this.manager.getRepository(CommunicationItemEntity).findOneOrFail({
      where: {
        id: savedCommunicationItemEntity.id,
      },
    });

    return CommunicationMapper.toItemDto(communicationItemEntity);
  }

  async bulkCreateItems(data: CommunicationItemCreateDto[]): Promise<void> {
    if (data.length === 0) {
      return;
    }

    const communicationItemsToSave = data.map(CommunicationMapper.toNewItemEntity);

    await runChunksSequentially(communicationItemsToSave, 500, chunk =>
      this.manager.getRepository(CommunicationItemEntity).insert(chunk)
    );
  }

  async updateItem(data: CommunicationItemDto): Promise<void> {
    const communicationItemEntityToSave = CommunicationMapper.toUpdateItemEntity(data);

    await this.manager.getRepository(CommunicationItemEntity).save(communicationItemEntityToSave);
  }

  async bulkUpdateItems(data: CommunicationItemDto[]): Promise<void> {
    const communicationItemEntityToSave = data.map(CommunicationMapper.toUpdateItemEntity);

    await this.manager.getRepository(CommunicationItemEntity).save(communicationItemEntityToSave);
  }

  async findItemById(id: string): Promise<CommunicationItemDto | null> {
    const communicationItemEntity = await this.manager.getRepository(CommunicationItemEntity).findOne({
      where: {
        id,
      },
    });

    if (!communicationItemEntity) {
      return null;
    }

    return CommunicationMapper.toItemDto(communicationItemEntity);
  }

  async listItemsByContactId(
    contactId: string,
    targetMessageId: string,
    direction: 'UP' | 'DOWN' | null,
    acknowledgerId: string,
    filterOptions?: {
      sources?: Array<CommunicationItemType>;
    }
  ): Promise<CommunicationItemDto[]> {
    const communication = await this.repository.findOne({
      where: {
        contactId,
      },
    });

    const { sources = [] } = filterOptions ?? {};

    const baseFindConditions: FindConditions<CommunicationItemEntity> = {
      communicationId: communication.id,
    };

    if (sources.length > 0) {
      baseFindConditions.type = In(sources);
    }

    let targetMessage: CommunicationItemEntity;

    if (!targetMessageId) {
      const firstUnreadItem = await this.manager
        .getRepository(CommunicationItemEntity)
        .createQueryBuilder('ci')
        .leftJoinAndSelect('ci.acknowledgement', 'cia')
        .leftJoin(CommunicationEntity, 'c', 'c.id = ci."communicationId"')
        .where('c."contactId" = :contactId', { contactId })
        .andWhere('cia.acknowledged = FALSE')
        .andWhere('cia."employeeId" = :acknowledgerId', { acknowledgerId })
        .orderBy('ci."createdAt"', 'ASC')
        .getOne();

      if (!firstUnreadItem) {
        const items = await this.manager.getRepository(CommunicationItemEntity).find({
          where: baseFindConditions,
          order: {
            createdAt: 'DESC',
          },
          take: 20,
        });

        const resortedItems = _(items)
          .orderBy(({ createdAt }) => createdAt, 'asc')
          .value();

        return resortedItems.map(CommunicationMapper.toItemDto);
      }

      targetMessage = firstUnreadItem;
    } else {
      targetMessage = await this.manager.getRepository(CommunicationItemEntity).findOne({
        where: {
          id: targetMessageId,
        },
      });
    }

    let communicationItemsToReturn: CommunicationItemEntity[] = [];

    const upOptions: FindManyOptions<CommunicationItemEntity> = {
      where: {
        ...baseFindConditions,
        createdAt: LessThanOrEqual(targetMessage.createdAt),
        id: Not(targetMessage.id),
      },
      order: {
        createdAt: 'DESC',
      },
    };

    const downOptions: FindManyOptions<CommunicationItemEntity> = {
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
        communicationItemsToReturn = communicationItemsToReturn.concat(
          await this.manager.getRepository(CommunicationItemEntity).find({
            ...upOptions,
            take: 20,
          })
        );

        break;
      case 'DOWN':
        communicationItemsToReturn = communicationItemsToReturn.concat(
          await this.manager.getRepository(CommunicationItemEntity).find({
            ...downOptions,
            take: 20,
          })
        );

        break;

      default:
        communicationItemsToReturn = communicationItemsToReturn.concat(
          targetMessage,

          await this.manager.getRepository(CommunicationItemEntity).find({
            ...downOptions,
            take: 19,
          })
        );

        if (communicationItemsToReturn.length < 20) {
          communicationItemsToReturn = communicationItemsToReturn.concat(
            await this.manager.getRepository(CommunicationItemEntity).find({
              ...upOptions,
              take: 20 - communicationItemsToReturn.length,
            })
          );
        }
    }

    const resortedItems = _(communicationItemsToReturn)
      .orderBy(({ createdAt }) => createdAt, 'asc')
      .value();

    return resortedItems.map(CommunicationMapper.toItemDto);
  }

  async create(contactId: string): Promise<CommunicationDto> {
    const savedCommunicationEntity = await this.repository.save({ contactId });

    const communicationEntity = await this.repository.findOneOrFail({
      where: {
        id: savedCommunicationEntity.id,
      },
    });

    return CommunicationMapper.toDto(communicationEntity);
  }

  async bulkCreate(contactIds: string[]): Promise<void> {
    if (contactIds.length === 0) {
      return;
    }

    await runChunksSequentially(contactIds, 500, chunk =>
      this.repository.insert(chunk.map(contactId => ({ contactId })))
    );
  }

  async findThreadForEmail(
    emailId: string
  ): Promise<Array<OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto>> {
    const emailEntity = await this.manager.getRepository(CommunicationItemEntity).findOne({
      where: {
        id: emailId,
      },
    });

    if (!emailEntity) {
      return [];
    }

    const communicationItemEntities = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .select()
      .leftJoinAndSelect('ci.acknowledgement', 'cia')
      .where("ci.payload->>'threadId' = :threadId", { threadId: emailEntity.payload.threadId })
      .andWhere(`ci."createdAt" < :date`, { date: emailEntity.createdAt })
      .getMany();

    return communicationItemEntities.map(CommunicationMapper.toItemDto) as Array<
      OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto
    >;
  }

  async listEmailsByExternaiId(
    emailExternalIds: string[]
  ): Promise<Array<OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto>> {
    const communicationItemEntities = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .select()
      .leftJoinAndSelect('ci.acknowledgement', 'cia')
      .where("ci.payload->>'extenalEmailId' IN (:...emailExternalIds)", { emailExternalIds })
      .getMany();

    return communicationItemEntities.map(CommunicationMapper.toItemDto) as Array<
      OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto
    >;
  }

  async findEmailByAttachmentId(
    attachmentId: string
  ): Promise<OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto | null> {
    const communicationItemEntity = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .select()
      .leftJoinAndSelect('ci.acknowledgement', 'cia')
      .where(`(ci.payload->>'emailAttachments')::jsonb @> '[{"attachmentId":"${attachmentId}"}]'`)
      .getOne();

    if (!communicationItemEntity) {
      return null;
    }

    return CommunicationMapper.toItemDto(communicationItemEntity) as
      | OutgoingEmailCommunicationItemDto
      | IncomingEmailCommunicationItemDto;
  }

  async countUnacknowledgedItemsForEmployeeGrouped(employeeId: string): Promise<
    Array<{
      communicationItemType: CommunicationItemType;
      systemMessageType: EventType | null;
      unacknowledgedItemsCount: number;
    }>
  > {
    const result: Array<{
      communicationItemType: CommunicationItemType;
      systemMessageType: EventType | null;
      unacknowledgedItemsCount: number;
    }> = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .select('ci."type"', 'communicationItemType')
      .addSelect(`ci.payload->>'eventType'`, 'systemMessageType')
      .addSelect('COUNT(ci.id)', 'unacknowledgedItemsCount')
      .leftJoin('ci.acknowledgement', 'cia')
      .where('cia."employeeId" = :employeeId', { employeeId })
      .andWhere('cia.acknowledged = FALSE')
      .groupBy('"communicationItemType"')
      .addGroupBy('"systemMessageType"')
      .execute();

    return result.map(value => ({ ...value, unacknowledgedItemsCount: +value.unacknowledgedItemsCount }));
  }

  async listUnacknowledgedItemsForEmployeeByContacts(
    employeeId: string,
    contactIds: string[]
  ): Promise<Record<string, CommunicationItemDto[]>> {
    if (contactIds.length === 0) {
      return {};
    }

    const result: Array<{
      contactId: string;
      communicationItemId: string;
    }> = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .select('c."contactId"', 'contactId')
      .addSelect('ci.id', 'communicationItemId')
      .leftJoin('ci.acknowledgement', 'cia')
      .leftJoin(CommunicationEntity, 'c', 'c.id = ci."communicationId"')
      .where('cia."employeeId" = :employeeId', { employeeId })
      .andWhere('c."contactId" IN (:...contactIds)', { contactIds })
      .andWhere('cia.acknowledged = FALSE')
      .execute();

    const itemIds = result.map(({ communicationItemId }) => communicationItemId);

    if (itemIds.length === 0) {
      return {};
    }

    const communicationItems = await this.manager.getRepository(CommunicationItemEntity).find({
      where: {
        id: In(itemIds),
      },
    });

    const communicationItemHashMap = createHashMap(communicationItems, ({ id }) => id);

    return _(result)
      .groupBy(({ contactId }) => contactId)
      .mapValues(items =>
        items.map(({ communicationItemId }) =>
          CommunicationMapper.toItemDto(communicationItemHashMap[communicationItemId])
        )
      )
      .value();
  }

  async listUnacknowledgedItemsForEmployeeByContact(
    employeeId: string,
    contactId: string
  ): Promise<CommunicationItemDto[]> {
    const communicationItems = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .leftJoinAndSelect('ci.acknowledgement', 'cia')
      .leftJoin(CommunicationEntity, 'c', 'c.id = ci."communicationId"')
      .where('cia."employeeId" = :employeeId', { employeeId })
      .andWhere('c."contactId" = :contactId', { contactId })
      .andWhere('cia.acknowledged = FALSE')
      .getMany();

    return communicationItems.map(CommunicationMapper.toItemDto);
  }

  async countUnacknowledgedItemsForEmployeeForContact(employeeId: string, contactId: string): Promise<number> {
    const result: number = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .leftJoin('ci.acknowledgement', 'cia')
      .leftJoin(CommunicationEntity, 'c', 'c.id = ci."communicationId"')
      .where('cia."employeeId" = :employeeId', { employeeId })
      .andWhere('c."contactId" = :contactId', { contactId })
      .andWhere('cia.acknowledged = FALSE')
      .getCount();

    return result;
  }

  async countUnacknowledgedItemsForEmployee(employeeId: string): Promise<number> {
    const result: number = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .leftJoin('ci.acknowledgement', 'cia')
      .leftJoin(CommunicationEntity, 'c', 'c.id = ci."communicationId"')
      .where('cia."employeeId" = :employeeId', { employeeId })
      .andWhere('cia.acknowledged = FALSE')
      .getCount();

    return result;
  }

  async listLastItemByContacts(contactIds: string[]): Promise<Record<string, CommunicationItemDto>> {
    if (contactIds.length === 0) {
      return {};
    }

    const result: Array<{
      contactId: string;
      communicationItemId: string;
    }> = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .distinctOn(['c."contactId"'])
      .select('c."contactId"', 'contactId')
      .addSelect('ci.id', 'communicationItemId')
      .leftJoin(CommunicationEntity, 'c', 'c.id = ci."communicationId"')
      .where('c."contactId" IN (:...contactIds)', { contactIds })
      .orderBy('c."contactId"')
      .addOrderBy('ci."createdAt"', 'DESC')
      .execute();

    const itemIds = result.map(({ communicationItemId }) => communicationItemId);

    if (itemIds.length === 0) {
      return {};
    }

    const communicationItems = await this.manager.getRepository(CommunicationItemEntity).find({
      where: {
        id: In(itemIds),
      },
    });

    const communicationItemHashMap = createHashMap(communicationItems, ({ id }) => id);

    return _(result)
      .keyBy(({ contactId }) => contactId)
      .mapValues(({ communicationItemId }) =>
        CommunicationMapper.toItemDto(communicationItemHashMap[communicationItemId])
      )
      .value();
  }

  async getLastItemByContact(contactId: string): Promise<CommunicationItemDto | null> {
    const communicationItem = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .leftJoinAndSelect('ci.acknowledgement', 'cia')
      .leftJoin(CommunicationEntity, 'c', 'c.id = ci."communicationId"')
      .where('c."contactId" = :contactId', { contactId })
      .orderBy('ci."createdAt"', 'DESC')
      .getOne();

    if (!communicationItem) {
      return null;
    }

    return CommunicationMapper.toItemDto(communicationItem);
  }

  async findSmsByExternalId(
    externalId: string
  ): Promise<IncomingSmsCommunicationItemDto | OutgoingSmsCommunicationItemDto | null> {
    const communicationItemEntity = await this.manager
      .getRepository(CommunicationItemEntity)
      .createQueryBuilder('ci')
      .select()
      .leftJoinAndSelect('ci.acknowledgement', 'cia')
      .where("ci.payload->>'externalId' = :externalId", { externalId })
      .getOne();

    if (!communicationItemEntity) {
      return null;
    }

    return CommunicationMapper.toItemDto(communicationItemEntity) as
      | IncomingSmsCommunicationItemDto
      | OutgoingSmsCommunicationItemDto;
  }

  async listItemsByIds(ids: string[]): Promise<CommunicationItemDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const communicationItemEntities = await this.manager.getRepository(CommunicationItemEntity).find({
      where: {
        id: In(ids),
      },
    });

    return communicationItemEntities.map(CommunicationMapper.toItemDto);
  }
}

import * as _ from 'lodash';
import { isNull } from 'lodash';
import type { FindConditions } from 'typeorm';
import { In } from 'typeorm';
import { Not } from 'typeorm';
import { Brackets } from 'typeorm';
import { AbstractRepository, EntityRepository } from 'typeorm';

import { createHashMap } from '../../../../common/utils/createHashMap';
import { runChunksSequentially } from '../../../../common/utils/runChunksSequentially';
import { runChunksSequentiallyAndFlatten } from '../../../../common/utils/runChunksSequentiallyAndFlatten';
import { BuildingChatItemType } from '../../../communications/application/enum/BuildingChatItemType';
import { CommunicationItemType } from '../../../communications/application/enum/CommunicationItemType';
import type { IContactRepository } from '../../application/boundaries/IContactRepository';
import type { ContactCreateDto } from '../../application/dataStructures/ContactCreateDto';
import type { ContactDto } from '../../application/dataStructures/ContactDto';
import type { ContactUpdateDto } from '../../application/dataStructures/ContactUpdateDto';
import { ContactEntity } from './ContactEntity';
import { ContactMapper } from './ContactMapper';

@EntityRepository(ContactEntity)
export class ContactRepository extends AbstractRepository<ContactEntity> implements IContactRepository {
  async findById(id: string): Promise<ContactDto | null> {
    const contactEntity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!contactEntity) {
      return null;
    }

    return ContactMapper.toDto(contactEntity);
  }

  async checkAreExistsByExternalId(externalIds: string[]): Promise<Record<string, string>> {
    const result: Array<{
      id: string;
      externalId: string;
    }> = await runChunksSequentiallyAndFlatten(externalIds, 500, chunk =>
      this.repository
        .createQueryBuilder('c')
        .select('c.id', 'id')
        .addSelect('c.externalId', 'externalId')
        .where('c.externalId IN (:...externalIds)', { externalIds: chunk })
        .execute()
    );

    return _(result)
      .keyBy(({ externalId }) => externalId)
      .mapValues(({ id }) => id)
      .value();
  }

  async checkAreExistsByEmail(emails: string[]): Promise<Record<string, string>> {
    const result: Array<{
      id: string;
      email: string;
    }> = await runChunksSequentiallyAndFlatten(emails, 500, chunk =>
      this.repository
        .createQueryBuilder('c')
        .select('c.id', 'id')
        .addSelect('c.email', 'email')
        .where('c.email IN (:...emails)', { emails: chunk })
        .execute()
    );

    return _(result)
      .keyBy(({ email }) => email)
      .mapValues(({ id }) => id)
      .value();
  }

  async checkAreExistsByPhone(phones: string[]): Promise<Record<string, string>> {
    const result: Array<{
      id: string;
      phone: string;
    }> = await runChunksSequentiallyAndFlatten(phones, 500, chunk =>
      this.repository
        .createQueryBuilder('c')
        .select('c.id', 'id')
        .addSelect('c.phone', 'phone')
        .where('c.phone IN (:...phones)', { phones: chunk })
        .execute()
    );

    return _(result)
      .keyBy(({ phone }) => phone)
      .mapValues(({ id }) => id)
      .value();
  }

  async bulkCreate(data: ContactCreateDto[]): Promise<string[]> {
    if (data.length === 0) {
      return [];
    }

    const contactEntityToSave = data.map(ContactMapper.toNewEntity);

    const identifiers = await runChunksSequentiallyAndFlatten(contactEntityToSave, 500, async chunk => {
      const result = await this.repository.insert(chunk);

      return result.identifiers;
    });

    return identifiers.map(object => Object.values(object)[0]);
  }

  async findByEmailOrPhone(params: {
    email?: string;
    phone?: string;
    omitContactId?: string;
  }): Promise<ContactDto | null> {
    const { email, phone, omitContactId } = params;

    if (!email && !phone) {
      return null;
    }

    const conditions: FindConditions<ContactEntity> = {};

    if (omitContactId) {
      conditions.id = Not(omitContactId);
    }

    let contactEntity: ContactEntity;

    if (phone) {
      contactEntity = await this.repository.findOne({
        where: {
          ...conditions,
          phone,
        },
      });
    }

    if (!contactEntity) {
      contactEntity = await this.repository.findOne({
        where: {
          ...conditions,
          email,
        },
      });
    }

    if (!contactEntity) {
      return null;
    }

    return ContactMapper.toDto(contactEntity);
  }

  async update(contact: ContactUpdateDto): Promise<void> {
    const contactEntityToSave = ContactMapper.toUpdateEntity(contact);

    await this.repository.save(contactEntityToSave);
  }

  async bulkUpdate(contacts: ContactUpdateDto[]): Promise<void> {
    if (contacts.length === 0) {
      return;
    }

    const contactEntityToSave = contacts.map(ContactMapper.toUpdateEntity);

    await runChunksSequentially(contactEntityToSave, 500, async chunk => {
      await this.repository.query(`
        UPDATE
          contact
        SET
          "firstName" = tmp."firstName",
          "lastName" = tmp."lastName",
          "email" = tmp."email",
          "emailIsConfirmed" = tmp."emailIsConfirmed",
          "phone" = tmp."phone",
          "phoneIsConfirmed" = tmp."phoneIsConfirmed",
          "externalId" = tmp."externalId"::uuid,
          "contactStyle" = tmp."contactStyle"::contact_contactstyle_enum[],
          "cameFrom" = tmp."cameFrom"::contact_camefrom_enum,
          "acquisitionData" = tmp."acquisitionData"::json,
          "ownerId" = tmp."ownerId"::uuid,
          "assigneeId" = tmp."assigneeId"::uuid
        FROM
          (
            VALUES 
            ${chunk
              .map(
                contact => `(
                    ${contact.id ? `'${contact.id}'::uuid` : 'NULL'},
                    ${contact.firstName ? `'${contact.firstName.replace("'", "''")}'` : 'NULL'},
                    ${contact.lastName ? `'${contact.lastName.replace("'", "''")}'` : 'NULL'},
                    ${contact.email ? `'${contact.email}'` : 'NULL'},
                    ${contact.emailIsConfirmed},
                    ${contact.phone ? `'${contact.phone}'` : 'NULL'},
                    ${contact.phoneIsConfirmed},
                    ${contact.externalId ? `'${contact.externalId}'` : 'NULL'},
                    ${
                      contact.contactStyle
                        ? `'${JSON.stringify(contact.contactStyle).replace('[', '{').replace(']', '}')}'`
                        : 'NULL'
                    },
                    ${contact.cameFrom ? `'${contact.cameFrom}'` : 'NULL'},
                    ${
                      contact.acquisitionData
                        ? `'${JSON.stringify(contact.acquisitionData).replace("'", "''")}'`
                        : 'NULL'
                    },
                    ${contact.ownerId ? `'${contact.ownerId}'` : 'NULL'},
                    ${contact.assigneeId ? `'${contact.assigneeId}'` : 'NULL'}
                  )`
              )
              .join(',\n')}
           
          ) AS tmp (
            "id",
            "firstName",
            "lastName",
            "email",
            "emailIsConfirmed",
            "phone",
            "phoneIsConfirmed",
            "externalId",
            "contactStyle",
            "cameFrom",
            "acquisitionData",
            "ownerId",
            "assigneeId"
          )
        WHERE
          contact.id = tmp.id; 
      `);
    });
  }

  async create(data: ContactCreateDto): Promise<ContactDto> {
    const contactEntityToSave = ContactMapper.toNewEntity(data);

    const savedContactEntity = await this.repository.save(contactEntityToSave);

    const contactEntity = await this.repository.findOneOrFail({
      where: {
        id: savedContactEntity.id,
      },
    });

    return ContactMapper.toDto(contactEntity);
  }

  async listContactsByIds(ids: string[]): Promise<ContactDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const contactEntities = await this.repository.find({
      where: {
        id: In(ids),
      },
    });

    return contactEntities.map(ContactMapper.toDto);
  }

  async listContacts(params: {
    ids: string[] | null;
    searchString?: string;
    ownerId?: string | null;
    skip: number;
    take: number;
  }): Promise<{
    items: ContactDto[];
    totalCount: number;
  }> {
    const { ownerId, searchString, ids, skip, take } = params;

    if (ids && ids.length === 0) {
      return {
        items: [],
        totalCount: 0,
      };
    }

    const queryBuilding = this.createQueryBuilder('c')
      .select('c.id', 'contactId')
      .addSelect('COUNT(cmp.id)', 'totalCount')
      .where('1 = 1')
      .groupBy('c.id')
      .orderBy('COUNT(cmp.id)', 'DESC')
      .addOrderBy('c."createdAt"', 'DESC')
      .offset(skip)
      .limit(take);

    if (ids) {
      queryBuilding.andWhere('c.id IN (:...ids)', { ids });
    }

    if (ownerId) {
      queryBuilding.andWhere('c."ownerId" = :ownerId', { ownerId });
    }

    if (isNull(ownerId)) {
      queryBuilding.andWhere('c."ownerId" IS NULL');
    }

    if (searchString) {
      queryBuilding.andWhere(
        new Brackets(qb => {
          qb.where(`c."firstName" ILIKE '%${searchString}%'`)
            .orWhere(`c."lastName" ILIKE '%${searchString}%'`)
            .orWhere(`c."phone" ILIKE '%${searchString}%'`)
            .orWhere(`c."email" ILIKE '%${searchString}%'`);
        })
      );
    }

    const result: Array<{
      contactId: string;
      totalCount: string;
    }> = await queryBuilding.execute();

    const [totalCount, contactEntities] = await Promise.all([
      queryBuilding.getCount(),

      this.repository.find({
        where: {
          id: In(result.map(({ contactId }) => contactId)),
        },
      }),
    ]);

    const contactEntitiesHashMap = createHashMap(contactEntities, ({ id }) => id);

    const sortedContactEntities = result.map(({ contactId }) => contactEntitiesHashMap[contactId]);

    return {
      items: sortedContactEntities.map(ContactMapper.toDto),
      totalCount,
    };
  }

  async findByExternalId(externalId: string): Promise<ContactDto | null> {
    const contactEntity = await this.repository.findOne({
      where: {
        externalId,
      },
    });

    if (!contactEntity) {
      return null;
    }

    return ContactMapper.toDto(contactEntity);
  }

  async listContactIdsByLatestMessages(
    employeeId: string,
    filterOptions?: {
      targetContactId?: string;
      source?: 'SMS' | 'EMAIL' | 'PRIVATE_NOTES' | 'BUILDING_CHATS' | 'REQUEST_MESSAGES' | 'OTHER_SYSTEM_MESSAGES';
      search?: string;
    }
  ): Promise<string[]> {
    const searchConditions = !filterOptions?.search
      ? 'TRUE'
      : `"firstName" ILIKE '%${filterOptions.search}%' OR "lastName" ILIKE '%${filterOptions.search}%'`;

    let communicationItemSourceCondition = 'TRUE';
    let buildingChatItemSourceCondition = 'TRUE';

    switch (filterOptions?.source) {
      case 'SMS':
        communicationItemSourceCondition = `ci.type IN (
            '${CommunicationItemType.INCOMING_SMS}', 
            '${CommunicationItemType.OUTGOING_SMS}'
          )`;

        buildingChatItemSourceCondition = 'FALSE';

        break;
      case 'EMAIL':
        communicationItemSourceCondition = `ci.type IN (
            '${CommunicationItemType.INCOMING_EMAIL}', 
            '${CommunicationItemType.OUTGOING_EMAIL}'
          )`;

        buildingChatItemSourceCondition = 'FALSE';

        break;
      case 'PRIVATE_NOTES':
        communicationItemSourceCondition = `ci.type = '${CommunicationItemType.PRIVATE_NOTES}'`;

        buildingChatItemSourceCondition = `bci.type = '${BuildingChatItemType.PRIVATE_NOTES}'`;

        break;
      case 'BUILDING_CHATS':
        communicationItemSourceCondition = 'FALSE';

        buildingChatItemSourceCondition = `bci.type IN (
            '${BuildingChatItemType.INCOMING_MESSAGE}', 
            '${BuildingChatItemType.OUTGOING_MESSAGE}'
          )`;

        break;

      default:
        break;
    }

    const havingCondition = filterOptions.targetContactId
      ? `
        having
          MAX(united_table."lastItemDate") < (
          select
            MAX(united_inner_table."lastItemDate")
          from
            (
            select
              MAX(ci."createdAt") as "lastItemDate"
            from
              "contact" "c"
            inner join "communication" "cm" on
              cm."contactId" = "c"."id"
            inner join "communication_item" "ci" on
              ci."communicationId" = "cm"."id"
            inner join "communication_item_acknowledgement" "cia" on
              cia."communicationItemId" = "ci"."id"
            where
              c.id = '${filterOptions.targetContactId}'
              and cia."employeeId" = '${employeeId}'
            group by
              "c"."id"
          union
            select
              MAX(bci."createdAt") as "lastItemDate"
            from
              "contact" "c"
            inner join "contact_building" "cb" on
              cb."contactId" = "c"."id"
            inner join "building_chat" "bc" on
              bc."contactBuildingId" = "cb"."id"
            inner join "building_chat_item" "bci" on
              bci."buildingChatId" = "bc"."id"
            inner join "building_chat_item_acknowledgement" "bcia" on
              bcia."buildingChatItemId" = "bci"."id"
            where
              bc.id = '${filterOptions.targetContactId}'
              and bcia."employeeId" = '${employeeId}'
            group by
              "c"."id"
            ) united_inner_table
        )
    `
      : '';

    const result: Array<{
      contactId: string;
      uniqueLastItemDate: Date;
    }> = await this.repository.query(`
      select 
        united_table."contactId" as "contactId",
        MAX(united_table."lastItemDate") as "uniqueLastItemDate"
      from (
        select
          "c"."id" as "contactId",
          MAX(ci."createdAt") as "lastItemDate"
        from
          "contact" "c"
        inner join "communication" "cm" on
          cm."contactId" = "c"."id"
        inner join "communication_item" "ci" on
          ci."communicationId" = "cm"."id"
        inner join "communication_item_acknowledgement" "cia" on
          cia."communicationItemId" = "ci"."id"
        where
          (${searchConditions})
          and ${communicationItemSourceCondition}
          and cia."employeeId" = '${employeeId}'
        group by
          "c"."id"
        union
        select
          "c"."id" as "contactId",
          MAX(bci."createdAt") as "lastItemDate"
        from
          "contact" "c"
        inner join "contact_building" "cb" on
          cb."contactId" = "c"."id"
        inner join "building_chat" "bc" on
          bc."contactBuildingId" = "cb"."id"
        inner join "building_chat_item" "bci" on
          bci."buildingChatId" = "bc"."id"
        inner join "building_chat_item_acknowledgement" "bcia" on
          bcia."buildingChatItemId" = "bci"."id"
        where
          (${searchConditions})
          and ${buildingChatItemSourceCondition}
          and bcia."employeeId" = '${employeeId}'
        group by
          "c"."id"
      ) united_table
      group by
        united_table."contactId"
      ${havingCondition}
      order by
        "uniqueLastItemDate" desc
      limit 15
    `);

    return result.map(({ contactId }) => contactId);
  }

  async findByEmployeeId(employeeId: string): Promise<ContactDto[]> {
    const contactEntities = await this.repository
      .createQueryBuilder('c')
      .select()
      .where('c."assigneeId" = :employeeId', { employeeId })
      .orWhere('c."ownerId" = :employeeId', { employeeId })
      .getMany();

    return contactEntities.map(ContactMapper.toDto);
  }

  async listByIds(ids: string[]): Promise<ContactDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const contactEntities = await this.repository.find({
      where: {
        id: In(ids),
      },
    });

    return contactEntities.map(ContactMapper.toDto);
  }
}

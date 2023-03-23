import { In } from 'typeorm';
import { AbstractRepository, EntityRepository } from 'typeorm';

import { ApplicationError } from '../../../../app/errors/application.error';
import { ContactEntity } from '../../../contacts/infrastructure/persistence/ContactEntity';
import type { IEmployeeRepository } from '../../application/boundaries/IEmployeeRepository';
import type { EmployeeCreateDto } from '../../application/dataStructures/EmployeeCreateDto';
import type { EmployeeDto } from '../../application/dataStructures/EmployeeDto';
import type { EmployeeTeamDto } from '../../application/dataStructures/EmployeeTeamDto';
import { EmployeeRole } from '../../application/enums/EmployeeRole';
import { EmployeeEntity } from './EmployeeEntity';
import { EmployeeMapper } from './EmployeeMapper';
import { EmployeeTeamEntity } from './EmployeeTeamEntity';

@EntityRepository(EmployeeEntity)
export class EmployeeRepository extends AbstractRepository<EmployeeEntity> implements IEmployeeRepository {
  async findByUserId(userId: string): Promise<EmployeeDto | null> {
    const contactEntity = await this.repository.findOne({
      where: {
        userId,
      },
    });

    if (!contactEntity) {
      return null;
    }

    return EmployeeMapper.toDto(contactEntity);
  }

  async listByIds(ids: string[]): Promise<EmployeeDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const employeeEntities = await this.repository.find({
      where: {
        id: In(ids),
      },
    });

    return employeeEntities.map(EmployeeMapper.toDto);
  }

  async listAll({ skip, take, roles }: { skip: number; take: number; roles: EmployeeRole[] }): Promise<{
    employees: EmployeeDto[];
    totalCount: number;
  }> {
    const queryBuilder = this.repository
      .createQueryBuilder('e')
      .select()
      .leftJoinAndSelect('e.team', 't')
      .orderBy('(CASE WHEN e."isAvailable" THEN 1 ELSE 2 END)', 'ASC')
      .addOrderBy('e."createdAt"', 'DESC');

    if (take) {
      queryBuilder.offset(skip).limit(take);
    }

    if (roles && roles.length > 0) {
      queryBuilder.andWhere(
        `e.roles && ('{
          ${roles.map(role => `"${role}"`).join(',')}
        }')`
      );
    }

    const [employeeEntities, totalCount] = await queryBuilder.getManyAndCount();

    const employees = employeeEntities.map(EmployeeMapper.toDto);

    return {
      employees,
      totalCount,
    };
  }

  async listAssignees(): Promise<EmployeeDto[]> {
    const employeeEntities = await this.repository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.team', 't')
      .innerJoin(ContactEntity, 'c', 'e.id = c."assigneeId" OR e.id = c."ownerId"')
      .where('e."isArchived" = :isArchived', {
        isArchived: false,
      })
      .andWhere('e."isAvailable" = :isAvailable', {
        isAvailable: true,
      })
      .getMany();

    return employeeEntities.map(EmployeeMapper.toDto);
  }

  async listAllTeams(): Promise<EmployeeTeamDto[]> {
    const employeeEntities = await this.manager.getRepository(EmployeeTeamEntity).find();

    return employeeEntities.map(EmployeeMapper.toTeamDto);
  }

  async findEmployeeTeamByRoleName(role: EmployeeRole): Promise<EmployeeTeamDto> {
    const employeeEntity = await this.manager.getRepository(EmployeeTeamEntity).findOne({
      where: {
        role,
      },
    });

    return EmployeeMapper.toTeamDto(employeeEntity);
  }

  async findRandomByTeamId(teamId: string): Promise<EmployeeDto | null> {
    const randomEmployeeEntity = await this.repository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.team', 't')
      .where('e."isAvailable" = :isAvailable', {
        isAvailable: true,
      })
      .andWhere('e."isArchived" = :isArchived', {
        isArchived: false,
      })
      .andWhere('e."teamId" = :teamId', {
        teamId,
      })
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!randomEmployeeEntity) {
      return null;
    }

    return EmployeeMapper.toDto(randomEmployeeEntity);
  }

  async findRandomByRole(role: EmployeeRole): Promise<EmployeeDto | null> {
    const randomEmployeeEntity = await this.repository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.team', 't')
      .where('e."isAvailable" = :isAvailable', {
        isAvailable: true,
      })
      .andWhere('e."isArchived" = :isArchived', {
        isArchived: false,
      })
      .andWhere(':role = ANY(e.roles)', {
        role,
      })
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!randomEmployeeEntity) {
      return null;
    }

    return EmployeeMapper.toDto(randomEmployeeEntity);
  }

  async findById(id: string): Promise<EmployeeDto | null> {
    const contactEntity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!contactEntity) {
      return null;
    }

    return EmployeeMapper.toDto(contactEntity);
  }

  async create(data: EmployeeCreateDto): Promise<EmployeeDto> {
    const applyInquiryEntityToSave = EmployeeMapper.toNewEntity(data);

    const savedEmployeeEntity = await this.repository.save(applyInquiryEntityToSave);

    const applyInquiryEntity = await this.repository.findOneOrFail({
      where: {
        id: savedEmployeeEntity.id,
      },
    });

    return EmployeeMapper.toDto(applyInquiryEntity);
  }

  async updateEmployee(data: EmployeeDto): Promise<void> {
    const employeeEntityToSave = EmployeeMapper.toUpdateEntity(data);

    await this.repository.save(employeeEntityToSave);
  }

  async getEmployeeWithTheLowestAssignedItemsByRole(role: EmployeeRole, employeeIdToOmit?: string): Promise<string> {
    const results: Array<{
      id: string;
      count: number;
    }> = await this.repository.query(`
        SELECT e.id, COUNT(*) FROM employee e 
        LEFT JOIN contact c on c."assigneeId" = e.id
        WHERE e.roles @> ('{"${role}"}')
          ${employeeIdToOmit ? `AND e.id != '${employeeIdToOmit}'` : ''}
          AND e."isAvailable" = TRUE
          AND e."isArchived" = FALSE
        GROUP BY e.id
        ORDER BY count ASC 
    `);

    if (!results.length) {
      throw new ApplicationError(`No searchlighter wasn't found`);
    }

    return results?.[0].id;
  }
}

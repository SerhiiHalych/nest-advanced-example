import type { EmployeeCreateDto } from '../../application/dataStructures/EmployeeCreateDto';
import type { EmployeeDto } from '../../application/dataStructures/EmployeeDto';
import type { EmployeeTeamDto } from '../../application/dataStructures/EmployeeTeamDto';
import type { EmployeeTeamEntity } from './EmployeeTeamEntity';
import type { NewEmployeeEntity } from './NewEmployeeEntity';
import type { UpdatableEmployeeEntity } from './UpdatableEmployeeEntity';

export class EmployeeMapper {
  static toDto(entity: EmployeeDto): EmployeeDto {
    return {
      id: entity.id,
      isArchived: entity.isArchived,
      isAvailable: entity.isAvailable,
      roles: entity.roles,
      userId: entity.userId,
      teamId: entity.teamId,
      team: entity.team,
      createdAt: entity.createdAt,
    };
  }

  static toTeamDto(entity: EmployeeTeamEntity): EmployeeTeamDto {
    return {
      createdAt: entity.createdAt,
      id: entity.id,
      name: entity.name,
      role: entity.role,
      updatedAt: entity.updatedAt,
    };
  }

  static toNewEntity(entity: EmployeeCreateDto): NewEmployeeEntity {
    return {
      isArchived: entity.isArchived,
      isAvailable: entity.isAvailable,
      roles: entity.roles,
      userId: entity.userId,
      teamId: entity.teamId,
    };
  }

  static toUpdateEntity(entity: EmployeeDto): UpdatableEmployeeEntity {
    return {
      id: entity.id,
      isArchived: entity.isArchived,
      isAvailable: entity.isAvailable,
      roles: entity.roles,
      userId: entity.userId,
      teamId: entity.teamId,
    };
  }
}

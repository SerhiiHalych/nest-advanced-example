import { Module } from '@nestjs/common';

import { CommandHandlerType, QueryHandlerType } from '../../common/diTokens';
import { ChangeRoleCommandHandler } from './application/commands/changeRole/ChangeRoleCommandHandler';
import { ChangeTeamCommandHandler } from './application/commands/changeTeam/ChangeTeamCommandHandler';
import { MarkUserInactiveHandler } from './application/commands/markUserInactive/MarkUserInactiveHandler';
import { GetNotificationsCountQueryHandler } from './application/queries/getNotificationsCount/GetNotificationsCountQueryHandler';
import { ListAvailableAssigneesQueryHandler } from './application/queries/listAvailableAssignees/ListAvailableAssigneesQueryHandler';
import { ListEmployeesQueryHandler } from './application/queries/listEmployees/ListEmployeesQueryHandler';
import { ListTeamsQueryHandler } from './application/queries/listTeams/ListTeamsQueryHandler';
import { EmployeeRolesGateway } from './EmployeeRolesGateway';
import { EmployeeRolesObserver } from './EmployeeRolesObserver';
import { EmployeeController } from './infrastructure/api/EmployeeController';
import { GlobalNotificationCounterGateway } from './infrastructure/gateways/globalNotificationCounter/GlobalNotificationCounterGateway';

@Module({
  controllers: [EmployeeController],
  providers: [
    EmployeeRolesObserver,
    EmployeeRolesGateway,
    GlobalNotificationCounterGateway,
    // Queries
    {
      provide: QueryHandlerType.LIST_AVAILABLE_ASSIGNEES,
      useClass: ListAvailableAssigneesQueryHandler,
    },
    {
      provide: QueryHandlerType.LIST_TEAMS,
      useClass: ListTeamsQueryHandler,
    },
    {
      provide: QueryHandlerType.LIST_EMPLOYEES,
      useClass: ListEmployeesQueryHandler,
    },
    {
      provide: QueryHandlerType.GET_NOTIFICATIONS_COUNT,
      useClass: GetNotificationsCountQueryHandler,
    },

    // Commands
    {
      provide: CommandHandlerType.CHANGE_ROLE_FOR_EMPLOYEE,
      useClass: ChangeRoleCommandHandler,
    },
    {
      provide: CommandHandlerType.CHANGE_TEAM_FOR_EMPLOYEE,
      useClass: ChangeTeamCommandHandler,
    },

    {
      provide: CommandHandlerType.MARK_USER_INACTIVE,
      useClass: MarkUserInactiveHandler,
    },
  ],
})
export class EmployeesModule {}

import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CommandHandlerType, QueryHandlerType } from '../../../../common/diTokens';
import { JwtAuthGuard } from '../../../../common/infrastructure/api/guards/jwt-auth.guard';
import { RequestGuard } from '../../../../common/infrastructure/api/guards/request.guard';
import { validateRequest } from '../../../../common/infrastructure/validation/joi/validateRequest';
import { IChangeRoleCommandHandler } from '../../application/commands/changeRole/IChangeRoleCommandHandler';
import { IChangeTeamCommandHandler } from '../../application/commands/changeTeam/IChangeTeamCommandHandler';
import { IMarkUserInactiveHandler } from '../../application/commands/markUserInactive/IMarkUserInactiveHandler';
import { EmployeeRole } from '../../application/enums/EmployeeRole';
import { IGetNotificationsCountQueryHandler } from '../../application/queries/getNotificationsCount/IGetNotificationsCountQueryHandler';
import { IListAvailableAssigneesQueryHandler } from '../../application/queries/listAvailableAssignees/IListAvailableAssigneesQueryHandler';
import { IListEmployeesQueryHandler } from '../../application/queries/listEmployees/IListEmployeesQueryHandler';
import { IListTeamsQueryHandler } from '../../application/queries/listTeams/IListTeamsQueryHandler';
import { ChangeRoleRequest, changeRoleRequestSchema } from './changeRole/ChangeRoleRequest';
import type { ChangeRoleResponse } from './changeRole/ChangeRoleResponse';
import { ChangeTeamRequest, changeTeamRequestSchema } from './changeTeam/ChangeTeamRequest';
import type { ChangeTeamResponse } from './changeTeam/ChangeTeamResponse';
import { GetNotificationsCountResponse } from './getNotificationsCount/GetNotificationsCountResponse';
import { ListAvailableAssigneesResponse } from './listAvailableAssignees/ListAvailableAssigneesResponse';
import { ListEmployeesRequestQuery, listEmployeesRequestSchema } from './listEmployees/ListEmployeesRequest';
import { ListEmployeesResponse } from './listEmployees/ListEmployeesResponse';
import { ListTeamsResponse } from './listTeams/ListTeamsResponse';
import { markUserInactiveRequest } from './markUserInactive/MarkUserInactiveRequest';
import type { MarkUserInactiveResponse } from './markUserInactive/MarkUserInactiveResponse';

@ApiTags('Employee resource')
@ApiBearerAuth('access-token')
@Controller({
  path: 'employees',
})
export class EmployeeController {
  constructor(
    @Inject(QueryHandlerType.LIST_AVAILABLE_ASSIGNEES)
    private listAvailableAssigneesQueryHandler: IListAvailableAssigneesQueryHandler,

    @Inject(QueryHandlerType.LIST_EMPLOYEES)
    private listEmployeesQueryHandler: IListEmployeesQueryHandler,

    @Inject(QueryHandlerType.LIST_TEAMS)
    private listTeamsQueryHandler: IListTeamsQueryHandler,

    @Inject(CommandHandlerType.CHANGE_ROLE_FOR_EMPLOYEE)
    private changeRoleForEmployee: IChangeRoleCommandHandler,

    @Inject(CommandHandlerType.CHANGE_TEAM_FOR_EMPLOYEE)
    private changeTeamForEmployee: IChangeTeamCommandHandler,

    @Inject(CommandHandlerType.MARK_USER_INACTIVE)
    private markUserInactive: IMarkUserInactiveHandler,

    @Inject(QueryHandlerType.GET_NOTIFICATIONS_COUNT)
    private getNotificationsCountQueryHandler: IGetNotificationsCountQueryHandler
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/notifications-count')
  @ApiOkResponse({ type: GetNotificationsCountResponse })
  async getNotificationCount(): Promise<GetNotificationsCountResponse> {
    const result = await this.getNotificationsCountQueryHandler.execute();

    return {
      notificationCount: result.notificationCount,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/contact-assignees')
  @ApiOkResponse({ type: ListAvailableAssigneesResponse })
  async listAvailableAssignees(): Promise<ListAvailableAssigneesResponse> {
    const result = await this.listAvailableAssigneesQueryHandler.execute();

    return {
      items: result.items.map(item => ({
        id: item.id,
        roles: item.roles,
        user: {
          familyName: item.user.familyName,
          givenName: item.user.givenName,
          id: item.user.id,
          picture: item.user.picture,
        },
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(validateRequest(listEmployeesRequestSchema))
  @Get()
  @ApiOkResponse({ type: ListEmployeesResponse })
  async listEmployees(@Query() query: ListEmployeesRequestQuery): Promise<ListEmployeesResponse> {
    const result = await this.listEmployeesQueryHandler.execute({
      skip: query.page * query.limit ?? null,
      take: query.limit ?? null,
      ownersOnly: query.ownersOnly === 'true',
    });

    return {
      items: result.items.map(item => ({
        id: item.id,
        roles: item.roles,
        team: item.team,
        isAvailable: item.isAvailable,
        user: {
          familyName: item.user.familyName,
          givenName: item.user.givenName,
          id: item.user.id,
          picture: item.user.picture,
          email: item.user.email,
        },
        createdAt: item.createdAt,
      })),
      meta: {
        currentPage: query.page || 0,
        totalItems: result.totalCount,
      },
    };
  }

  @ApiOperation({
    tags: ['Employee', 'Teams'],
    description: `Gets all available teams.`,
  })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ListTeamsResponse })
  @Get('/teams')
  async listTeams(): Promise<ListTeamsResponse> {
    const result = await this.listTeamsQueryHandler.execute();

    return {
      items: result.items.map(item => ({
        createdAt: item.createdAt,
        id: item.id,
        name: item.name,
        role: item.role,
        updatedAt: item.updatedAt,
      })),
    };
  }

  @ApiOperation({
    tags: ['Employee', 'Teams'],
    description: `Change role of user.`,
  })
  @UseInterceptors(validateRequest(changeRoleRequestSchema))
  @UseGuards(JwtAuthGuard, RequestGuard([EmployeeRole.ADMINISTRATORS]))
  @ApiOkResponse({ type: ListTeamsResponse })
  @Post('/change-role')
  async changeRole(@Body() body: ChangeRoleRequest): Promise<ChangeRoleResponse> {
    return this.changeRoleForEmployee.execute(body);
  }

  @ApiOperation({
    tags: ['Employee', 'Teams'],
    description: `Change role of user.`,
  })
  @UseInterceptors(validateRequest(changeTeamRequestSchema))
  @UseGuards(JwtAuthGuard, RequestGuard([EmployeeRole.ADMINISTRATORS]))
  @ApiOkResponse({ type: ListTeamsResponse })
  @Post('/change-team')
  async changeTeam(@Body() body: ChangeTeamRequest): Promise<ChangeTeamResponse> {
    return this.changeTeamForEmployee.execute(body);
  }

  @ApiOperation({
    tags: ['Employee', 'Teams'],
    description: `Mark user inactive.`,
  })
  @UseInterceptors(validateRequest(markUserInactiveRequest))
  @UseGuards(JwtAuthGuard, RequestGuard([EmployeeRole.ADMINISTRATORS]))
  @ApiOkResponse({ type: ListTeamsResponse })
  @Get('/mark-inactive/:employeeId')
  async markInactive(@Param('employeeId') employeeId: string): Promise<MarkUserInactiveResponse> {
    return this.markUserInactive.execute({
      employeeId,
    });
  }
}

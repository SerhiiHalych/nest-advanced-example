import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Readable } from 'stream';

import { CommandHandlerType, QueryHandlerType } from '../../../../common/diTokens';
import { JwtAuthGuard } from '../../../../common/infrastructure/api/guards/jwt-auth.guard';
import { RequestGuard } from '../../../../common/infrastructure/api/guards/request.guard';
import { validateRequest } from '../../../../common/infrastructure/validation/joi/validateRequest';
import { EmployeeRole } from '../../../employees/application/enums/EmployeeRole';
import { IChangeContactAssigneeCommandHandler } from '../../application/commands/changeContactAssignee/IChangeContactAssigneeCommandHandler';
import { IChangeContactOwnerCommandHandler } from '../../application/commands/changeContactOwner/IChangeContactOwnerCommandHandler';
import { ICreateNewContactCommandHandler } from '../../application/commands/createNewContact/ICreateNewContactCommandHandler';
import { IEditContactCommandHandler } from '../../application/commands/editContact/IEditContactCommandHandler';
import { IEditContactBuildingCommandHandler } from '../../application/commands/editContactBuilding/IEditContactBuildingCommandHandler';
import { IImportContactsCommandHandler } from '../../application/commands/importContacts/IImportContactsCommandHandler';
import { IImportContactsFromFoobarCommandHandler } from '../../application/commands/importContactsFromFoobar/IImportContactsFromFoobarCommandHandler';
import { IListContactsQueryHandler } from '../../application/queries/listContacts/IListContactsQueryHandler';
import { ISearchContentQueryHandler } from '../../application/queries/searchContent/ISearchContentQueryHandler';
import { ChangeContactAssigneeRequestBody } from './changeContactAssignee/ChangeContactAssigneeRequest';
import { changeContactAssigneeRequestSchema } from './changeContactAssignee/ChangeContactAssigneeRequest';
import { ChangeContactAssigneeResponse } from './changeContactAssignee/ChangeContactAssigneeResponse';
import { ChangeContactOwnerRequestBody } from './changeContactOwner/ChangeContactOwnerRequest';
import { changeContactOwnerRequestSchema } from './changeContactOwner/ChangeContactOwnerRequest';
import { ChangeContactOwnerResponse } from './changeContactOwner/ChangeContactOwnerResponse';
import { CreateNewContactRequestBody } from './createNewContact/CreateNewContactRequest';
import { createNewContactRequestSchema } from './createNewContact/CreateNewContactRequest';
import { CreateNewContactResponse } from './createNewContact/CreateNewContactResponse';
import { EditContactRequestBody } from './editContact/EditContactRequest';
import { editContactRequestSchema } from './editContact/EditContactRequest';
import { EditContactResponse } from './editContact/EditContactResponse';
import { EditContactBuildingRequestBody } from './editContactBuilding/EditContactBuildingRequest';
import { editContactBuildingRequestSchema } from './editContactBuilding/EditContactBuildingRequest';
import { EditContactBuildingResponse } from './editContactBuilding/EditContactBuildingResponse';
import { ImportContactsRequestBody } from './importContacts/ImportContactsRequest';
import { importContactsRequestBodySchema } from './importContacts/ImportContactsRequest';
import { ImportContactsResponse } from './importContacts/ImportContactsResponse';
import { ImportContactsFromFoobarRequestBody } from './importContactsFromFoobar/ImportContactsFromFoobarRequest';
import { importContactsFromFoobarRequestBodySchema } from './importContactsFromFoobar/ImportContactsFromFoobarRequest';
import { ImportContactsFromFoobarResponse } from './importContactsFromFoobar/ImportContactsFromFoobarResponse';
import { ListContactsRequestQuery } from './listContacts/ListContactsRequest';
import { listContactsRequestSchema } from './listContacts/ListContactsRequest';
import { ListContactsResponse } from './listContacts/ListContactsResponse';
import { searchContentRequestSchema } from './searchContent/SearchContentRequest';
import { SearchContentResponse } from './searchContent/SearchContentResponse';

@ApiTags('Contact')
@Controller({
  path: 'contacts',
})
export class ContactController {
  constructor(
    @Inject(QueryHandlerType.SEARCH_CONTENT)
    private searchContentQueryHandler: ISearchContentQueryHandler,

    @Inject(CommandHandlerType.CREATE_NEW_CONTACT)
    private createNewContactCommandHandler: ICreateNewContactCommandHandler,

    @Inject(CommandHandlerType.EDIT_CONTACT)
    private editContactCommandHandler: IEditContactCommandHandler,

    @Inject(CommandHandlerType.CHANGE_CONTACT_ASSIGNEE)
    private changeContactAssigneeCommandHandler: IChangeContactAssigneeCommandHandler,

    @Inject(CommandHandlerType.CHANGE_CONTACT_OWNER)
    private changeContactOwnerCommandHandler: IChangeContactOwnerCommandHandler,

    @Inject(QueryHandlerType.LIST_CONTACTS)
    private listContactsQueryHandler: IListContactsQueryHandler,

    @Inject(CommandHandlerType.EDIT_CONTACT_BUILDING)
    private editContactBuildingCommandHandler: IEditContactBuildingCommandHandler,

    @Inject(CommandHandlerType.IMPORT_CONTACTS_COMMAND_HANDLER)
    private importContactsCommandHandler: IImportContactsCommandHandler,

    @Inject(CommandHandlerType.IMPORT_CONTACTS_FROM_LIGHTHOUSE_COMMAND_HANDLER)
    private importContactsFromFoobarCommandHandler: IImportContactsFromFoobarCommandHandler
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(validateRequest(searchContentRequestSchema))
  @ApiOkResponse({ type: SearchContentResponse })
  @Get(':contactId/search-content')
  searchContent(
    @Param('contactId') contactId: string,
    @Query('content') content: string
  ): Promise<SearchContentResponse> {
    return this.searchContentQueryHandler.execute({
      contactId,
      content,
    });
  }

  @ApiOperation({
    description: `Creates new Contact.`,
  })
  @UseGuards(
    JwtAuthGuard,
    RequestGuard([
      EmployeeRole.DISPATCHERS,
      EmployeeRole.LIGHTKEEPERS,
      EmployeeRole.ADMINISTRATORS,
      EmployeeRole.SEARCHLIGHTS,
    ])
  )
  @UseInterceptors(validateRequest(createNewContactRequestSchema))
  @ApiOkResponse({ type: CreateNewContactResponse })
  @Post()
  async createContact(@Body() body: CreateNewContactRequestBody): Promise<CreateNewContactResponse> {
    const result = await this.createNewContactCommandHandler.execute({
      cameFrom: body.cameFrom ?? null,
      contactStyle: body.contactStyle ?? [],
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
    });

    return {
      createdAt: result.createdAt,
      email: result.email,
      firstName: result.firstName,
      id: result.id,
      lastName: result.lastName,
      owner: result.owner,
      phone: result.phone,
    };
  }

  @ApiOperation({
    description: `Updates existing Contact.`,
  })
  @UseGuards(
    JwtAuthGuard,
    RequestGuard([
      EmployeeRole.DISPATCHERS,
      EmployeeRole.LIGHTKEEPERS,
      EmployeeRole.ADMINISTRATORS,
      EmployeeRole.SEARCHLIGHTS,
    ])
  )
  @UseInterceptors(validateRequest(editContactRequestSchema))
  @ApiOkResponse({ type: EditContactResponse })
  @Patch(':contactId')
  async updateContact(
    @Param('contactId') contactId: string,
    @Body() body: EditContactRequestBody
  ): Promise<EditContactResponse> {
    const result = await this.editContactCommandHandler.execute({
      contactId,
      cameFrom: body.cameFrom,
      contactStyle: body.contactStyle,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
    });

    return {
      acquisitionData: result.acquisitionData,
      cameFrom: result.cameFrom,
      contactStyle: result.contactStyle,
      email: result.email,
      externalId: result.externalId,
      firstName: result.firstName,
      id: result.id,
      lastName: result.lastName,
      phone: result.phone,
    };
  }

  @ApiOperation({
    description: `Allows Contact reassignment.`,
  })
  @UseGuards(
    JwtAuthGuard,
    RequestGuard([
      EmployeeRole.DISPATCHERS,
      EmployeeRole.LIGHTKEEPERS,
      EmployeeRole.ADMINISTRATORS,
      EmployeeRole.SEARCHLIGHTS,
    ])
  )
  @UseInterceptors(validateRequest(changeContactAssigneeRequestSchema))
  @ApiOkResponse({ type: ChangeContactAssigneeResponse })
  @Post(':contactId/change-assignee')
  async assignContact(
    @Param('contactId') contactId: string,
    @Body() body: ChangeContactAssigneeRequestBody
  ): Promise<ChangeContactAssigneeResponse> {
    const { assignee } = await this.changeContactAssigneeCommandHandler.execute({
      assigneeId: body.assigneeId,
      contactId,
    });

    if (assignee) {
      return {
        assignee: {
          id: assignee.id,
          roles: assignee.roles,
          user: {
            familyName: assignee.user.familyName,
            givenName: assignee.user.givenName,
            id: assignee.user.id,
            picture: assignee.user.picture,
          },
        },
      };
    }

    return { assignee: null };
  }

  @ApiOperation({
    description: `Allows Owner reassignment.`,
  })
  @UseGuards(
    JwtAuthGuard,
    RequestGuard([
      EmployeeRole.DISPATCHERS,
      EmployeeRole.LIGHTKEEPERS,
      EmployeeRole.ADMINISTRATORS,
      EmployeeRole.SEARCHLIGHTS,
    ])
  )
  @UseInterceptors(validateRequest(changeContactOwnerRequestSchema))
  @ApiOkResponse({ type: ChangeContactOwnerResponse })
  @Post(':contactId/change-owner')
  async assignOwner(
    @Param('contactId') contactId: string,
    @Body() body: ChangeContactOwnerRequestBody
  ): Promise<ChangeContactOwnerResponse> {
    const result = await this.changeContactOwnerCommandHandler.execute({
      ownerId: body.ownerId,
      contactId,
    });

    let assignee = null;
    let owner = null;

    if (result.assignee) {
      assignee = {
        id: result.assignee.id,
        roles: result.assignee.roles,
        user: {
          familyName: result.assignee.user.familyName,
          givenName: result.assignee.user.givenName,
          id: result.assignee.user.id,
          picture: result.assignee.user.picture,
        },
      };
    }

    if (result.owner) {
      owner = {
        id: result.owner.id,
        roles: result.owner.roles,
        user: {
          familyName: result.owner.user.familyName,
          givenName: result.owner.user.givenName,
          id: result.owner.user.id,
          picture: result.owner.user.picture,
        },
      };
    }

    return {
      owner,
      assignee,
    };
  }

  @UseGuards(
    JwtAuthGuard,
    RequestGuard([
      EmployeeRole.DISPATCHERS,
      EmployeeRole.LIGHTKEEPERS,
      EmployeeRole.ADMINISTRATORS,
      EmployeeRole.SEARCHLIGHTS,
    ])
  )
  @UseInterceptors(validateRequest(editContactBuildingRequestSchema))
  @ApiOkResponse({ type: EditContactBuildingResponse })
  @Patch(':contactId/buildings/:buildingId')
  async update(
    @Param('contactId') contactId: string,
    @Param('buildingId') buildingId: string,
    @Body() body: EditContactBuildingRequestBody
  ): Promise<EditContactBuildingResponse> {
    const result = await this.editContactBuildingCommandHandler.execute({
      contactId,
      buildingId,
      notes: body.notes,
    });

    return {
      id: result.id,
      notes: result.notes,
    };
  }

  @ApiOperation({
    description: `Provides a paginated list of Contacts with additional default sorting.
    Additionally allows to filter results either by provided search or by applying filter preset.`,
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(validateRequest(listContactsRequestSchema))
  @ApiOkResponse({ type: ListContactsResponse })
  @Get()
  async getSortedContacts(@Query() query: ListContactsRequestQuery): Promise<ListContactsResponse> {
    const result = await this.listContactsQueryHandler.execute({
      skip: query.page * query.limit,
      take: query.limit,
      filterId: query.filterId,
      ownerId: query.ownerId,
      searchString: query.search,
    });

    return {
      items: result.items.map(item => ({
        createdAt: item.createdAt,
        email: item.email,
        firstName: item.firstName,
        id: item.id,
        lastName: item.lastName,
        owner: item.owner
          ? {
              id: item.owner.id,
              user: {
                familyName: item.owner.user.familyName,
                givenName: item.owner.user.givenName,
                id: item.owner.user.id,
                picture: item.owner.user.picture,
              },
            }
          : null,
        phone: item.phone,
      })),
      meta: {
        currentPage: query.page,
        totalItems: result.totalCount,
      },
    };
  }

  @ApiOperation({ summary: 'Import contacts from csv file' })
  @UseInterceptors(AnyFilesInterceptor(), validateRequest(importContactsRequestBodySchema))
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ImportContactsResponse })
  @Post('/import')
  async importContacts(
    @UploadedFiles()
    files: Array<{
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    }>,
    @Body() body: ImportContactsRequestBody
  ): Promise<ImportContactsResponse> {
    return await this.importContactsCommandHandler.execute({
      assigneeEmail: body.assigneeEmail,
      csvFile: Readable.from(files[0].buffer),
    });
  }

  @ApiOperation({ summary: 'Import contacts from Foobar website from csv file' })
  @UseInterceptors(AnyFilesInterceptor(), validateRequest(importContactsFromFoobarRequestBodySchema))
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ImportContactsFromFoobarResponse })
  @Post('/import/foobar')
  async importContactsFromFoobar(
    @UploadedFiles()
    files: Array<{
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    }>,
    @Body() body: ImportContactsFromFoobarRequestBody
  ): Promise<ImportContactsFromFoobarResponse> {
    return await this.importContactsFromFoobarCommandHandler.execute({
      assigneeEmail: body.assigneeEmail,
      csvFile: Readable.from(files[0].buffer),
    });
  }
}

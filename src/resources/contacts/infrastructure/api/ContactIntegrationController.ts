import { Body, Controller, Inject, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CommandHandlerType } from '../../../../common/diTokens';
import { IntegrationJwtAuthGuard } from '../../../../common/infrastructure/api/guards/integration-jwt-auth.guard';
import { validateRequest } from '../../../../common/infrastructure/validation/joi/validateRequest';
import { ICreateNewContactFromExternalSourceCommandHandler } from '../../application/commands/createNewContactFromExternalSource/ICreateNewContactFromExternalSourceCommandHandler';
import { IEditContactFromExternalSourceCommandHandler } from '../../application/commands/editContactFromExternalSource/IEditContactFromExternalSourceCommandHandler';
import {
  CreateNewContactFromExternalSourceRequestBody,
  createNewContactFromExternalSourceRequestSchema,
} from './createNewContactFromExternalSource/CreateNewContactFromExternalSourceRequest';
import { CreateNewContactFromExternalSourceResponse } from './createNewContactFromExternalSource/CreateNewContactFromExternalSourceResponse';
import {
  EditContactFromExternalSourceRequestBody,
  editContactFromExternalSourceRequestSchema,
} from './editContactFromExternalSource/EditContactFromExternalSourceRequest';
import { EditContactFromExternalSourceResponse } from './editContactFromExternalSource/EditContactFromExternalSourceResponse';

@ApiTags('Contact', 'Integration')
@ApiBearerAuth('Authorization')
@Controller({
  path: 'integration/contacts',
})
export class ContactIntegrationController {
  constructor(
    @Inject(CommandHandlerType.CREATE_NEW_CONTACT_FROM_EXTERNAL_SOURCE)
    private createNewContactFromExternalSourceCommandHandler: ICreateNewContactFromExternalSourceCommandHandler,

    @Inject(CommandHandlerType.EDIT_CONTACT_FROM_EXTERNAL_SOURCE)
    private editContactHandlerFromExternalSource: IEditContactFromExternalSourceCommandHandler
  ) {}

  @ApiOperation({
    description: `Integration endpoint that could be used by 3rd party to create new Contacts in the CRM.`,
  })
  @UseGuards(IntegrationJwtAuthGuard)
  @UseInterceptors(validateRequest(createNewContactFromExternalSourceRequestSchema))
  @ApiOkResponse({ type: CreateNewContactFromExternalSourceResponse })
  @Post()
  async createNewContact(
    @Body() body: CreateNewContactFromExternalSourceRequestBody
  ): Promise<CreateNewContactFromExternalSourceResponse> {
    const result = await this.createNewContactFromExternalSourceCommandHandler.execute({
      acquisitionData: body?.acquisitionData
        ? {
            acquisitionChannel: body.acquisitionData.acquisitionChannel,
            campaign: body.acquisitionData.campaign,
            device: body.acquisitionData.device,
            gAId: body.acquisitionData.gAId,
            gclId: body.acquisitionData.gclId,
            foobarId: body.acquisitionData.foobarId,
            medium: body.acquisitionData.medium,
            referredBy: body.acquisitionData.referredBy,
            signUpLink: body.acquisitionData.signUpLink,
            source: body.acquisitionData.source,
            stytchId: body.acquisitionData.stytchId,
            term: body.acquisitionData.term,
            userIP: body.acquisitionData.userIP,
          }
        : null,
      cameFrom: body.cameFrom,
      contactStyle: body.contactStyle,
      email: body.email,
      emailIsConfirmed: body.emailIsConfirmed,
      externalContactId: body.contactId,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      phoneIsConfirmed: body.phoneIsConfirmed,
    });

    return {
      id: result.id,
    };
  }

  @ApiOperation({
    description: `Integration endpoint that is be used by foobar to update contact in the CRM.`,
  })
  @UseInterceptors(validateRequest(editContactFromExternalSourceRequestSchema))
  @UseGuards(IntegrationJwtAuthGuard)
  @ApiOkResponse({ type: EditContactFromExternalSourceResponse })
  @Patch(':contactId')
  async updateContact(
    @Param('contactId') contactId: string,
    @Body() body: EditContactFromExternalSourceRequestBody
  ): Promise<EditContactFromExternalSourceResponse> {
    return this.editContactHandlerFromExternalSource.execute({
      externalContactId: contactId,
      cameFrom: body.cameFrom,
      contactStyle: body.contactStyle,
      email: body.email,
      emailIsConfirmed: body.emailIsConfirmed,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      phoneIsConfirmed: body.phoneIsConfirmed,
      acquisitionData: body.acquisitionData,
    });
  }
}

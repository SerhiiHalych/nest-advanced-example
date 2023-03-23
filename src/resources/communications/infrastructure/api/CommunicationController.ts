import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Readable } from 'typeorm/platform/PlatformTools';

import { CommandHandlerType, QueryHandlerType } from '../../../../common/diTokens';
import { JwtAuthGuard } from '../../../../common/infrastructure/api/guards/jwt-auth.guard';
import { RequestExtended } from '../../../../common/infrastructure/api/RequestExtended';
import { validateRequest } from '../../../../common/infrastructure/validation/joi/validateRequest';
import { IAddBuildingChatItemCommandHandler } from '../../application/commands/addBuildingChatItem/IAddBuildingChatItemCommandHandler';
import { IAddCommunicationItemCommandHandler } from '../../application/commands/addCommunicationItem/IАddCommunicationItemCommandHandler';
import { IHandleGettingOfIncomingSmsCommandHandler } from '../../application/commands/handleGettingOfIncomingSms/IHandleGettingOfIncomingSmsCommandHandler';
import { IHandleSmsStatusChangingCommandHandler } from '../../application/commands/handleSmsStatusChanging/IHandleSmsStatusChangingCommandHandler';
import { IImportCommunicationsCommandHandler } from '../../application/commands/importCommunications/IImportCommunicationsCommandHandler';
import type { CommunicationItemType } from '../../application/enum/CommunicationItemType';
import { IDownloadAttachmentQueryHandler } from '../../application/queries/downloadAttachment/IDownloadAttachmentQueryHandler';
import { IGetBuildingChatItemsInfoQueryHandler } from '../../application/queries/getBuildingChatItemsInfo/IGetBuildingChatItemsInfoQueryHandler';
import { IGetCommunicationItemsInfoQueryHandler } from '../../application/queries/getCommunicationItemsInfo/IGetCommunicationItemsInfoQueryHandler';
import { IListBuildingChatsQueryHandler } from '../../application/queries/listBuildingChats/IListBuildingChatsQueryHandler';
import {
  AddBuildingChatItemRequestBody,
  addBuildingChatItemRequestSchema,
} from './addBuildingChatItem/AddCommunicationItemRequest';
import { AddBuildingChatItemResponse } from './addBuildingChatItem/AddCommunicationItemResponse';
import {
  AddCommunicationItemRequestBody,
  addCommunicationItemRequestSchema,
} from './addCommunicationItem/AddCommunicationItemRequest';
import { AddCommunicationItemResponse } from './addCommunicationItem/AddCommunicationItemResponse';
import {
  DownloadAttachmentRequestParams,
  downloadAttachmentRequestSchema,
} from './downloadAttachment/DownloadAttachmentRequest';
import { GetBuildingChatMessagesInfoResponse } from './getBuildingChatMessagesInfo/GetBuildingChatMessagesInfoResponse';
import { GetMessagesInfoResponse } from './getMessagesInfo/GetMessagesInfoResponse';
import type { HandleGettingOfIncomingSmsRequest } from './handleGettingOfIncomingSms/handleGettingOfIncomingSmsRequest';
import {
  ImportCommunicationsRequestBody,
  importCommunicationsRequestBodySchema,
} from './importCommunications/ImportCommunicationsRequest';
import { ImportCommunicationsResponse } from './importCommunications/ImportCommunicationsResponse';
import { ListBuildingChatsResponse } from './listBuildingChats/ListBuildingChatsResponse';
import type { SmsStatusWebhookRequestBody } from './smsStatusWebhook/SmsStatusWebhookRequest';

@ApiTags('Communications resource')
@ApiBearerAuth('access-token')
@Controller({
  path: 'communications',
})
export class CommunicationController {
  constructor(
    @Inject(CommandHandlerType.ADD_COMMUNICATION_ITEM)
    private addCommunicationItemCommandHandler: IAddCommunicationItemCommandHandler,

    @Inject(CommandHandlerType.ADD_BUILDING_CHAT_ITEM)
    private addBuildingChatItemCommandHandler: IAddBuildingChatItemCommandHandler,

    @Inject(CommandHandlerType.HANDLE_GETTING_OF_INCOMING_SMS)
    private handleGettingOfIncomingSmsCommandHandler: IHandleGettingOfIncomingSmsCommandHandler,

    @Inject(CommandHandlerType.HANDLE_SMS_STATUS_CHANGING_COMMAND_HANDLER)
    private handleSmsStatusChangingCommandHandler: IHandleSmsStatusChangingCommandHandler,

    @Inject(QueryHandlerType.GET_COMMUNICATION_ITEMS_INFO)
    private getCommunicationItemsInfoQueryHandler: IGetCommunicationItemsInfoQueryHandler,

    @Inject(QueryHandlerType.GET_BUILDING_CHAT_ITEMS_INFO)
    private getBuildingChatItemsInfoQueryHandler: IGetBuildingChatItemsInfoQueryHandler,

    @Inject(QueryHandlerType.LIST_BUILDING_CHATS)
    private listBuildingChatsQueryHandler: IListBuildingChatsQueryHandler,

    @Inject(QueryHandlerType.DOWNLOAD_ATTACHMENT)
    private downloadAttachmentQueryHandler: IDownloadAttachmentQueryHandler,

    @Inject(CommandHandlerType.IMPORT_COMMUNICATIONS_COMMAND_HANDLER)
    private importCommunicationsCommandHandler: IImportCommunicationsCommandHandler
  ) {}

  @ApiOperation({ summary: 'For adding message too communication box' })
  @UseInterceptors(AnyFilesInterceptor(), validateRequest(addCommunicationItemRequestSchema))
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: AddCommunicationItemResponse })
  @Post('/messages')
  async addCommunicationItem(
    @UploadedFiles()
    files: Array<{
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    }>,
    @Body() body: AddCommunicationItemRequestBody
  ): Promise<AddCommunicationItemResponse> {
    return this.addCommunicationItemCommandHandler.execute({
      contactId: body.contactId,
      payload: {
        attachments: files.map(file => {
          const fileParts = file.originalname.split('.');

          const fileExtencion = fileParts[fileParts.length - 1];

          const fileName = fileParts.slice(0, -1).join('.');

          return {
            fileExtension: fileExtencion,
            fileName: fileName,
            fileData: file.buffer,
            fileSize: file.size,
          };
        }),
        bcc: body.payload.bcc,
        cc: body.payload.cc,
        subject: body.payload.subject,
        text: body.payload.text,
        replyTo: body.payload.replyTo,
      },
      type: body.type,
    });
  }

  @Get('/attachments/:attachmentId')
  @ApiOperation({ summary: 'Download email attachment' })
  @UseInterceptors(validateRequest(downloadAttachmentRequestSchema))
  async downloadAttachment(@Param() params: DownloadAttachmentRequestParams): Promise<StreamableFile> {
    const result = await this.downloadAttachmentQueryHandler.execute({
      attachmentId: params.attachmentId,
    });

    return new StreamableFile(result.fileData);
  }

  @ApiOperation({ summary: 'Webhook for twilio for getting sms.' })
  @Post('/sms')
  async getMessage(
    @Headers('X-Twilio-Signature') twilioSignature: string,
    @Req() req: RequestExtended,
    @Res() res: Response
  ): Promise<void> {
    const originalBody: HandleGettingOfIncomingSmsRequest = req.originalBody;

    await this.handleGettingOfIncomingSmsCommandHandler.execute({
      twilioSignature,
      body: {
        AccountSid: originalBody.AccountSid,
        ApiVersion: originalBody.ApiVersion,
        Body: originalBody.Body,
        From: originalBody.From,
        FromCity: originalBody.FromCity,
        FromCountry: originalBody.FromCountry,
        FromState: originalBody.FromState,
        FromZip: originalBody.FromZip,
        MessageSid: originalBody.MessageSid,
        NumMedia: +originalBody.NumMedia,
        NumSegments: +originalBody.NumSegments,
        ReferralNumMedia: +originalBody.ReferralNumMedia,
        SmsMessageSid: originalBody.SmsMessageSid,
        SmsSid: originalBody.SmsSid,
        SmsStatus: originalBody.SmsStatus,
        To: originalBody.To,
        ToCity: originalBody.ToCity,
        ToCountry: originalBody.ToCountry,
        ToState: originalBody.ToState,
        ToZip: originalBody.ToZip,
      },
    });

    res.end();
  }

  @ApiOperation({ summary: 'Webhook for twilio for getting sms status updates.' })
  @Post('/sms/status')
  async smsStatusWebhook(
    @Headers('X-Twilio-Signature') twilioSignature: string,
    @Req() req: RequestExtended,
    @Res() res: Response
  ): Promise<void> {
    const originalBody: SmsStatusWebhookRequestBody = req.originalBody;

    await this.handleSmsStatusChangingCommandHandler.execute({
      twilioSignature,
      body: originalBody,
    });

    res.end();
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetMessagesInfoResponse })
  @Get()
  async findById(
    @Query('contactId') contactId: string,
    @Query('targetMessageId') targetMessageId: string | null,
    @Query('direction') direction: 'UP' | 'DOWN' | null,
    @Query('sources') sources?: Array<CommunicationItemType>
  ): Promise<GetMessagesInfoResponse> {
    return this.getCommunicationItemsInfoQueryHandler.execute({
      contactId,
      direction: direction ?? null,
      targetMessageId: targetMessageId ?? null,
      sources:
        sources && typeof sources === 'string' ? ((sources as string).split(',') as CommunicationItemType[]) : sources,
    });
  }

  @ApiOperation({ summary: 'Send building chat message' })
  @UseInterceptors(AnyFilesInterceptor(), validateRequest(addBuildingChatItemRequestSchema))
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: AddBuildingChatItemResponse })
  @Post('/building-chats/messages')
  async addBuildingChatItem(@Body() body: AddBuildingChatItemRequestBody): Promise<AddBuildingChatItemResponse> {
    return this.addBuildingChatItemCommandHandler.execute({
      contactId: body.contactId,
      buildingId: body.buildingId,
      payload: {
        text: body.payload.text,
      },
      type: body.type,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetBuildingChatMessagesInfoResponse })
  @Get('/building-chats/messages')
  async getBuildingChatMessagesInfo(
    @Query('contactId') contactId: string,
    @Query('buildingId') buildingId: string,
    @Query('targetMessageId') targetMessageId: string | null,
    @Query('direction') direction: 'UP' | 'DOWN' | null
  ): Promise<GetBuildingChatMessagesInfoResponse> {
    return this.getBuildingChatItemsInfoQueryHandler.execute({
      contactId,
      buildingId,
      direction: direction ?? null,
      targetMessageId: targetMessageId ?? null,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ListBuildingChatsResponse })
  @Get('/building-chats')
  async listBuildingChats(@Query('contactId') contactId: string): Promise<ListBuildingChatsResponse> {
    return this.listBuildingChatsQueryHandler.execute({
      contactId,
    });
  }

  @ApiOperation({ summary: 'Import communications from csv file' })
  @UseInterceptors(AnyFilesInterceptor(), validateRequest(importCommunicationsRequestBodySchema))
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ImportCommunicationsResponse })
  @Post('/import')
  async importCommunications(
    @UploadedFiles()
    files: Array<{
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    }>,
    @Body() body: ImportCommunicationsRequestBody
  ): Promise<ImportCommunicationsResponse> {
    return await this.importCommunicationsCommandHandler.execute({
      assigneeEmail: body.assigneeEmail,
      csvFile: Readable.from(files[0].buffer),
    });
  }
}

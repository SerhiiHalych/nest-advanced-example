import type { EventType } from '../../../../common/application/EventType';
import type { CommunicationItemType } from '../enum/CommunicationItemType';
import type { SmsState } from '../enum/SmsState';

export type CommunicationItemDto =
  | IncomingSmsCommunicationItemDto
  | OutgoingSmsCommunicationItemDto
  | PrivateNotesCommunicationItemDto
  | OutgoingEmailCommunicationItemDto
  | IncomingEmailCommunicationItemDto
  | SystemMessageCommunicationItemDto;

interface BaseCommunicationItemDto {
  id: string;
  createdAt: Date;
  communicationId: string;
  acknowledgement: Array<{
    employeeId: string;
    acknowledged: boolean;
  }>;
}

export interface IncomingSmsCommunicationItemDto extends BaseCommunicationItemDto {
  payload: {
    externalId: string;
    text: string;
    media: Array<{
      mediaId: string;
      url: string;
      contentType: string;
    }>;
  };
  type: CommunicationItemType.INCOMING_SMS;
}

export interface OutgoingSmsCommunicationItemDto extends BaseCommunicationItemDto {
  payload: {
    externalId: string;
    errorCode: string | null;
    state: SmsState;
    text: string;
    senderId: string;
    media: Array<{
      s3Key: string | null;
      mediaId: string | null;
      url: string | null;
      contentType: string;
    }>;
  };
  type: CommunicationItemType.OUTGOING_SMS;
}

export interface PrivateNotesCommunicationItemDto extends BaseCommunicationItemDto {
  payload: {
    text: string;
    senderId: string;
  };
  type: CommunicationItemType.PRIVATE_NOTES;
}

export interface OutgoingEmailCommunicationItemDto extends BaseCommunicationItemDto {
  payload: {
    text: string;
    senderId: string;
    cc: string[];
    bcc: string[];
    subject: string;
    threadId: string;
    extenalEmailId: string;
    headerMessageId: string;
    emailAttachments: Array<{
      attachmentId: string;
      filename: string;
      extension: string;
      size: number;
    }>;
  };
  type: CommunicationItemType.OUTGOING_EMAIL;
}

export interface IncomingEmailCommunicationItemDto extends BaseCommunicationItemDto {
  payload: {
    text: string;
    cc: string[];
    bcc: string[];
    subject: string;
    threadId: string;
    extenalEmailId: string;
    headerMessageId: string;
    emailAttachments: Array<{
      attachmentId: string;
      filename: string;
      extension: string;
      size: number;
    }>;
  };
  type: CommunicationItemType.INCOMING_EMAIL;
}

export type SystemMessageCommunicationItemDto =
  | ContactOwnerChangedSystemMessageCommunicationItemDto
  | ContactAssigneeChangedSystemMessageCommunicationItemDto
  | NewContactCreatedSystemMessageCommunicationItemDto;

export interface ContactOwnerChangedSystemMessageCommunicationItemDto extends BaseCommunicationItemDto {
  payload: {
    eventType: EventType.CONTACT_OWNER_CHANGED;
    eventPayload: {
      contactId: string;
      previousOwnerId: string;
      newOwnerId: string;
    };
  };
  type: CommunicationItemType.SYSTEM_MESSAGE;
}

export interface ContactAssigneeChangedSystemMessageCommunicationItemDto extends BaseCommunicationItemDto {
  payload: {
    eventType: EventType.CONTACT_ASSIGNEE_CHANGED;
    eventPayload: {
      contactId: string;
      previousAssigneeId: string;
      newAssigneeId: string;
    };
  };
  type: CommunicationItemType.SYSTEM_MESSAGE;
}

export interface NewContactCreatedSystemMessageCommunicationItemDto extends BaseCommunicationItemDto {
  payload: {
    eventType: EventType.NEW_CONTACT_CREATED;
    eventPayload: {
      contactId: string;
    };
  };
  type: CommunicationItemType.SYSTEM_MESSAGE;
}

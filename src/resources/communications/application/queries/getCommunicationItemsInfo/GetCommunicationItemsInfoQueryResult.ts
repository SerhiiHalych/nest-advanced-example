import type { EventType } from '../../../../../common/application/EventType';
import type { CommunicationItemType } from '../../enum/CommunicationItemType';
import type { SmsState } from '../../enum/SmsState';

interface GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  id: string;
  createdAt: Date;
}

export interface GetCommunicationItemsInfoQueryResultIncomingSmsCommunicationItem
  extends GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  payload: {
    text: string;
    media: Array<{
      url: string;
      contentType: string;
    }>;
  };
  type: CommunicationItemType.INCOMING_SMS;
}

export interface GetCommunicationItemsInfoQueryResultOutgoingSmsCommunicationItem
  extends GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  payload: {
    text: string;
    errorCode: string;
    state: SmsState;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      photoUrl: string;
    };
    media: Array<{
      url: string;
      contentType: string;
    }>;
  };
  type: CommunicationItemType.OUTGOING_SMS;
}

export interface GetCommunicationItemsInfoQueryResultPrivateNotesCommunicationItem
  extends GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  payload: {
    text: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      photoUrl: string;
    };
  };
  type: CommunicationItemType.PRIVATE_NOTES;
}

export interface GetCommunicationItemsInfoQueryResultOutgoingEmailCommunicationItem
  extends GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  payload: {
    text: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      photoUrl: string;
    };
    cc: string[];
    bcc: string[];
    subject: string;
    threadMessages: string[];
    emailAttachments: Array<{
      attachmentId: string;
      filename: string;
      extension: string;
      data: string;
      size: number;
    }>;
  };
  type: CommunicationItemType.OUTGOING_EMAIL;
}

export interface GetCommunicationItemsInfoQueryResultIncomingEmailCommunicationItem
  extends GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  payload: {
    text: string;
    cc: string[];
    bcc: string[];
    subject: string;
    threadMessages: string[];
    emailAttachments: Array<{
      attachmentId: string;
      filename: string;
      data: string;
      extension: string;
      size: number;
    }>;
  };
  type: CommunicationItemType.INCOMING_EMAIL;
}
export interface GetCommunicationItemsInfoQueryResultContactOwnerChangedSystemMessageCommunicationItem
  extends GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  payload: {
    eventType: EventType.CONTACT_OWNER_CHANGED;
    eventPayload: {
      contactId: string;
      newOwner: {
        id: string;
        firstName: string;
        lastName: string;
      };
      oldOwner: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };
  type: CommunicationItemType.SYSTEM_MESSAGE;
}

export interface GetCommunicationItemsInfoQueryResultContactAssigneeChangedSystemMessageCommunicationItem
  extends GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  payload: {
    eventType: EventType.CONTACT_ASSIGNEE_CHANGED;
    eventPayload: {
      contactId: string;
      newAssignee: {
        id: string;
        firstName: string;
        lastName: string;
      };
      oldAssignee: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };
  type: CommunicationItemType.SYSTEM_MESSAGE;
}

export interface GetCommunicationItemsInfoQueryResultNewContactCreatedSystemMessageCommunicationItem
  extends GetCommunicationItemsInfoQueryResultBaseCommunicationItem {
  payload: {
    eventType: EventType.NEW_CONTACT_CREATED;
    eventPayload: {
      contactId: string;
      firstName: string;
      lastName: string;
    };
  };
  type: CommunicationItemType.SYSTEM_MESSAGE;
}

export type GetCommunicationItemsInfoQueryResultSystemMessageCommunicationItem =
  | GetCommunicationItemsInfoQueryResultContactOwnerChangedSystemMessageCommunicationItem
  | GetCommunicationItemsInfoQueryResultContactAssigneeChangedSystemMessageCommunicationItem
  | GetCommunicationItemsInfoQueryResultNewContactCreatedSystemMessageCommunicationItem;

export type GetCommunicationItemsInfoQueryResultMessage = (
  | GetCommunicationItemsInfoQueryResultIncomingSmsCommunicationItem
  | GetCommunicationItemsInfoQueryResultOutgoingSmsCommunicationItem
  | GetCommunicationItemsInfoQueryResultPrivateNotesCommunicationItem
  | GetCommunicationItemsInfoQueryResultOutgoingEmailCommunicationItem
  | GetCommunicationItemsInfoQueryResultIncomingEmailCommunicationItem
  | GetCommunicationItemsInfoQueryResultSystemMessageCommunicationItem
) & {
  acknowledged: boolean;
};

export interface GetCommunicationItemsInfoQueryResult {
  messages: GetCommunicationItemsInfoQueryResultMessage[];
}

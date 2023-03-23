import type { EventType } from '../../../../../common/application/EventType';
import type { BuildingChatItemType } from '../../../application/enum/BuildingChatItemType';
import type { CommunicationItemType } from '../../../application/enum/CommunicationItemType';
import type { SmsState } from '../../../application/enum/SmsState';

interface NewCommunicationItemMessageBase {
  id: string;
  createdAt: Date;
  acknowledged: boolean;
}

interface NewBuildingChatItemMessageBase {
  id: string;
  createdAt: Date;
  buildingId: string;
  acknowledged: boolean;
}

export interface NewCommunicationItemMessageIncomingSmsCommunicationItem extends NewCommunicationItemMessageBase {
  payload: {
    text: string;
    media: Array<{
      url: string;
      contentType: string;
    }>;
  };
  type: CommunicationItemType.INCOMING_SMS;
}

export interface NewCommunicationItemMessageOutgoingSmsCommunicationItem extends NewCommunicationItemMessageBase {
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

export interface NewCommunicationItemMessagePrivateNotesCommunicationItem extends NewCommunicationItemMessageBase {
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

export interface NewBuildingChatItemMessageIncomingMessage extends NewBuildingChatItemMessageBase {
  payload: {
    text: string;
  };
  type: BuildingChatItemType.INCOMING_MESSAGE;
}

export interface NewBuildingChatItemMessageOutgoingMessage extends NewBuildingChatItemMessageBase {
  payload: {
    text: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      photoUrl: string;
    };
  };
  type: BuildingChatItemType.OUTGOING_MESSAGE;
}

export interface NewBuildingChatItemMessagePrivateNotes extends NewBuildingChatItemMessageBase {
  payload: {
    text: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      photoUrl: string;
    };
  };
  type: BuildingChatItemType.PRIVATE_NOTES;
}

export interface NewCommunicationItemMessageOutgoingEmailCommunicationItem extends NewCommunicationItemMessageBase {
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
      size: number;
    }>;
  };
  type: CommunicationItemType.OUTGOING_EMAIL;
}

export interface NewCommunicationItemMessageIncomingEmailCommunicationItem extends NewCommunicationItemMessageBase {
  payload: {
    text: string;
    cc: string[];
    bcc: string[];
    subject: string;
    threadMessages: string[];
    emailAttachments: Array<{
      attachmentId: string;
      filename: string;
      extension: string;
      size: number;
    }>;
  };
  type: CommunicationItemType.INCOMING_EMAIL;
}

export interface NewCommunicationItemMessageContactOwnerChangedSystemMessageCommunicationItem
  extends NewCommunicationItemMessageBase {
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

export interface NewCommunicationItemMessageContactAssigneeChangedSystemMessageCommunicationItem
  extends NewCommunicationItemMessageBase {
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

export interface NewCommunicationItemMessageNewContactCreatedSystemMessageCommunicationItem
  extends NewCommunicationItemMessageBase {
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

export type NewCommunicationItemMessageSystemMessageCommunicationItem =
  | NewCommunicationItemMessageContactOwnerChangedSystemMessageCommunicationItem
  | NewCommunicationItemMessageContactAssigneeChangedSystemMessageCommunicationItem
  | NewCommunicationItemMessageNewContactCreatedSystemMessageCommunicationItem;

export type NewCommunicationItemMessage =
  | NewCommunicationItemMessageIncomingSmsCommunicationItem
  | NewCommunicationItemMessageOutgoingSmsCommunicationItem
  | NewCommunicationItemMessagePrivateNotesCommunicationItem
  | NewCommunicationItemMessageOutgoingEmailCommunicationItem
  | NewCommunicationItemMessageIncomingEmailCommunicationItem
  | NewCommunicationItemMessageSystemMessageCommunicationItem;

export type NewBuildingChatItemMessage =
  | NewBuildingChatItemMessageIncomingMessage
  | NewBuildingChatItemMessageOutgoingMessage
  | NewBuildingChatItemMessagePrivateNotes;

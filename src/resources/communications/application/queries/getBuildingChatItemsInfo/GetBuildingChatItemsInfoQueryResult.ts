import type { BuildingChatItemType } from '../../enum/BuildingChatItemType';

interface GetBuildingChatItemsInfoQueryResultBaseBuildingChatItem {
  id: string;
  createdAt: Date;
}

export interface GetBuildingChatItemsInfoQueryResultIncomingMessageBuildingChatItem
  extends GetBuildingChatItemsInfoQueryResultBaseBuildingChatItem {
  payload: {
    text: string;
  };
  type: BuildingChatItemType.INCOMING_MESSAGE;
}

export interface GetBuildingChatItemsInfoQueryResultOutgoingMessageBuildingChatItem
  extends GetBuildingChatItemsInfoQueryResultBaseBuildingChatItem {
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

export interface GetBuildingChatItemsInfoQueryResultPrivateNotesBuildingChatItem
  extends GetBuildingChatItemsInfoQueryResultBaseBuildingChatItem {
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

export type GetBuildingChatItemsInfoQueryResultMessage = (
  | GetBuildingChatItemsInfoQueryResultIncomingMessageBuildingChatItem
  | GetBuildingChatItemsInfoQueryResultOutgoingMessageBuildingChatItem
  | GetBuildingChatItemsInfoQueryResultPrivateNotesBuildingChatItem
) & {
  acknowledged: boolean;
};

export interface GetBuildingChatItemsInfoQueryResult {
  messages: GetBuildingChatItemsInfoQueryResultMessage[];
}

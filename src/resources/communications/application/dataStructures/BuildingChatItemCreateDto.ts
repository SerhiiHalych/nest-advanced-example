import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { BuildingChatItemDto } from './BuildingChatItemDto';

export type BuildingChatItemCreateDto = OmitTyped<BuildingChatItemDto, 'id' | 'createdAt'>;

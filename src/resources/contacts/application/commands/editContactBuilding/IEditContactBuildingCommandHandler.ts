import type { EditContactBuildingCommandInput } from './EditContactBuildingCommandInput';
import type { EditContactBuildingCommandResult } from './EditContactBuildingCommandResult';

export interface IEditContactBuildingCommandHandler {
  execute(input: EditContactBuildingCommandInput): Promise<EditContactBuildingCommandResult>;
}

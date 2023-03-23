import type { ChangeTeamCommandInput } from './ChangeTeamCommandInput';
import type { ChangeTeamCommandResult } from './ChnageTeamCommandResult';

export interface IChangeTeamCommandHandler {
  execute(input: ChangeTeamCommandInput): Promise<ChangeTeamCommandResult>;
}

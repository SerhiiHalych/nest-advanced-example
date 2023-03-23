import type { AddCommunicationItemCommandInput } from './АddCommunicationItemCommandInput';
import type { AddCommunicationItemCommandResult } from './АddCommunicationItemCommandResult';

export interface IAddCommunicationItemCommandHandler {
  execute(input: AddCommunicationItemCommandInput): Promise<AddCommunicationItemCommandResult>;
}

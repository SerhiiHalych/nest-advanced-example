import type { MarkUserInactiveInput } from './MarkUserInactiveInput';
import type { MarkUserInactiveResult } from './MarkUserInactiveResult';

export interface IMarkUserInactiveHandler {
  execute(input: MarkUserInactiveInput): Promise<MarkUserInactiveResult>;
}

import type { HandleOAuthRedirectCommandInput } from './HandleOAuthRedirectCommandInput';

export interface IHandleOAuthRedirectCommandHandler {
  execute(input: HandleOAuthRedirectCommandInput): Promise<void>;
}

import type { ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WebsocketExceptionsFilter implements WsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient();
    const error = exception.getError();
    const details = typeof error === 'string' ? { message: error } : error;

    client.emit('error', details);
  }
}

import { WsException } from '@nestjs/websockets';

interface CustomValidationErrors {
  field: string;
  message: string;
}

export class WsValidationException extends WsException {
  constructor(validationErrors: CustomValidationErrors[]) {
    super(validationErrors);
  }
}

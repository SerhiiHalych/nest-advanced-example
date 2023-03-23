import { BadRequestException } from '@nestjs/common';

export class ContactNotUnique extends BadRequestException {
  name: string;
  stack?: string;
  existingContactId: string;

  constructor(existingContactId: string) {
    super({
      error: `Contact with same phone number or email already exists.`,
      existingContactId,
    });
  }
}

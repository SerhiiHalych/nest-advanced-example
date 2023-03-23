import { v4 } from 'uuid';

export class UUIDGenerator {
  static generate(): string {
    return v4();
  }
}

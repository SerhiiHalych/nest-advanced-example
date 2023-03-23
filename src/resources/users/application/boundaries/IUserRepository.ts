import type { UserCreateDto } from '../dataStructures/UserCreateDto';
import type { UserDto } from '../dataStructures/UserDto';
import type { UserUpdateDto } from '../dataStructures/UserUpdateDto';

export interface IUserRepository {
  findById(id: string): Promise<UserDto | null>;

  findByEmail(email: string): Promise<UserDto | null>;

  findByExternalId(externalId: string): Promise<UserDto | null>;

  listByIds(ids: string[]): Promise<UserDto[]>;

  create(data: UserCreateDto): Promise<UserDto>;

  update(data: UserUpdateDto): Promise<void>;
}

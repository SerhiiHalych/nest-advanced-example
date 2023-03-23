import { Global, Injectable, Scope } from '@nestjs/common';
import type { QueryRunner } from 'typeorm';
import { getConnection } from 'typeorm';

import type { IBuildingRepository } from '../../../resources/buildings/application/boundaries/IBuildingRepository';
import { BuildingRepository } from '../../../resources/buildings/infrastructure/persistence/BuildingRepository';
import type { IBuildingChatRepository } from '../../../resources/communications/application/boundaries/IBuildingChatRepository';
import type { ICommunicationRepository } from '../../../resources/communications/application/boundaries/ICommunicationRepository';
import { BuildingChatRepository } from '../../../resources/communications/infrastructure/persistence/buildingChat/BuildingChatRepository';
import type { IContactBuildingRepository } from '../../../resources/contacts/application/boundaries/IContactBuildingRepository';
import type { IContactRepository } from '../../../resources/contacts/application/boundaries/IContactRepository';
import { ContactBuildingRepository } from '../../../resources/contacts/infrastructure/persistence/ContactBuildingRepository';
import { ContactRepository } from '../../../resources/contacts/infrastructure/persistence/ContactRepository';
import type { IEmployeeRepository } from '../../../resources/employees/application/boundaries/IEmployeeRepository';
import { EmployeeRepository } from '../../../resources/employees/infrastructure/persistence/EmployeeRepository';
import type { ISettingsRepository } from '../../../resources/settings/application/boundaries/ISettingsRepository';
import { SettingsRepository } from '../../../resources/settings/infrastructure/persistence/SettingsRepository';
import type { IUserRepository } from '../../../resources/users/application/boundaries/IUserRepository';
import { UserRepository } from '../../../resources/users/infrastructure/persistence/UserRepository';
import type { IGlobalDBContext } from '../../application/IGlobalDBContext';

@Global()
@Injectable({ scope: Scope.REQUEST })
export class GlobalDBContext implements IGlobalDBContext {
  private _queryRunner: QueryRunner;
  private _buildingRepository: IBuildingRepository;
  private _contactRepository: IContactRepository;
  private _employeeRepository: IEmployeeRepository;
  private _userRepository: IUserRepository;
  private _contactBuildingRepository: IContactBuildingRepository;
  private _communicationRepository: ICommunicationRepository;
  private _settingsRepository: ISettingsRepository;
  private _buildingChatRepository: IBuildingChatRepository;

  private initRepositories(): void {
    this._queryRunner = getConnection().createQueryRunner();

    this._buildingRepository = this._queryRunner.manager.getCustomRepository(BuildingRepository);
    this._contactRepository = this._queryRunner.manager.getCustomRepository(ContactRepository);
    this._employeeRepository = this._queryRunner.manager.getCustomRepository(EmployeeRepository);
    this._userRepository = this._queryRunner.manager.getCustomRepository(UserRepository);
    this._contactBuildingRepository = this._queryRunner.manager.getCustomRepository(ContactBuildingRepository);
    this._settingsRepository = this._queryRunner.manager.getCustomRepository(SettingsRepository);
    this._buildingChatRepository = this._queryRunner.manager.getCustomRepository(BuildingChatRepository);
  }

  get buildingRepository(): IBuildingRepository {
    return this._buildingRepository;
  }

  get contactRepository(): IContactRepository {
    return this._contactRepository;
  }

  get employeeRepository(): IEmployeeRepository {
    return this._employeeRepository;
  }

  get userRepository(): IUserRepository {
    return this._userRepository;
  }

  get contactBuildingRepository(): IContactBuildingRepository {
    return this._contactBuildingRepository;
  }

  get communicationRepository(): ICommunicationRepository {
    return this._communicationRepository;
  }

  get settingsRepository(): ISettingsRepository {
    return this._settingsRepository;
  }

  get buildingChatRepository(): IBuildingChatRepository {
    return this._buildingChatRepository;
  }

  startTransaction(): Promise<void> {
    this.initRepositories();

    return this._queryRunner.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    await this._queryRunner.commitTransaction();

    await this._queryRunner.release();
  }

  async rollbackTransaction(): Promise<void> {
    await this._queryRunner.rollbackTransaction();

    await this._queryRunner.release();
  }

  async releaseConnection(): Promise<void> {
    await this._queryRunner.release();
  }
}

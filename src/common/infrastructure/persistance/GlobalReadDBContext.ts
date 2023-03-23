import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';

import type { IBuildingRepository } from '../../../resources/buildings/application/boundaries/IBuildingRepository';
import { BuildingRepository } from '../../../resources/buildings/infrastructure/persistence/BuildingRepository';
import type { IBuildingChatRepository } from '../../../resources/communications/application/boundaries/IBuildingChatRepository';
import type { ICommunicationRepository } from '../../../resources/communications/application/boundaries/ICommunicationRepository';
import { BuildingChatRepository } from '../../../resources/communications/infrastructure/persistence/buildingChat/BuildingChatRepository';
import { CommunicationRepository } from '../../../resources/communications/infrastructure/persistence/communication/CommunicationRepository';
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
import type { IGlobalReadDBContext } from '../../application/IGlobalReadDBContext';

@Injectable()
export class GlobalReadDBContext implements IGlobalReadDBContext {
  get buildingRepository(): IBuildingRepository {
    return getConnection().manager.getCustomRepository(BuildingRepository);
  }

  get contactRepository(): IContactRepository {
    return getConnection().manager.getCustomRepository(ContactRepository);
  }

  get employeeRepository(): IEmployeeRepository {
    return getConnection().manager.getCustomRepository(EmployeeRepository);
  }

  get userRepository(): IUserRepository {
    return getConnection().manager.getCustomRepository(UserRepository);
  }

  get contactBuildingRepository(): IContactBuildingRepository {
    return getConnection().manager.getCustomRepository(ContactBuildingRepository);
  }

  get communicationRepository(): ICommunicationRepository {
    return getConnection().manager.getCustomRepository(CommunicationRepository);
  }

  get settingsRepository(): ISettingsRepository {
    return getConnection().manager.getCustomRepository(SettingsRepository);
  }

  get buildingChatRepository(): IBuildingChatRepository {
    return getConnection().manager.getCustomRepository(BuildingChatRepository);
  }
}

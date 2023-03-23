import type { IBuildingRepository } from '../../resources/buildings/application/boundaries/IBuildingRepository';
import type { IBuildingChatRepository } from '../../resources/communications/application/boundaries/IBuildingChatRepository';
import type { ICommunicationRepository } from '../../resources/communications/application/boundaries/ICommunicationRepository';
import type { IContactBuildingRepository } from '../../resources/contacts/application/boundaries/IContactBuildingRepository';
import type { IContactRepository } from '../../resources/contacts/application/boundaries/IContactRepository';
import type { IEmployeeRepository } from '../../resources/employees/application/boundaries/IEmployeeRepository';
import type { ISettingsRepository } from '../../resources/settings/application/boundaries/ISettingsRepository';
import type { IUserRepository } from '../../resources/users/application/boundaries/IUserRepository';

export interface IGlobalReadDBContext {
  buildingRepository: IBuildingRepository;
  contactRepository: IContactRepository;
  employeeRepository: IEmployeeRepository;
  userRepository: IUserRepository;
  contactBuildingRepository: IContactBuildingRepository;
  communicationRepository: ICommunicationRepository;
  settingsRepository: ISettingsRepository;
  buildingChatRepository: IBuildingChatRepository;
}

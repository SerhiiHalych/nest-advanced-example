import type { BuildingSource } from '../../../buildings/application/enum/BuildingSource';

export interface ContactBuildingDto {
  id: string;
  contactId: string;
  buildingId: string;
  notes: string | null;
  createdAt: Date;
  source: BuildingSource;
}

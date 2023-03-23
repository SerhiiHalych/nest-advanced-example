interface ExternalBuildingPropertyFloorPlan {
  bathroomCount: number;
  minRent: number;
  maxRent: number;
  deposit: number;
  name: string;
  bedroomCount: number;
  sqftAvg: number;
  availability: Date;
  unitsAvailable: number;
  unitsCount: number;
}

export interface ExternalBuildingDto {
  id: string | null;
  name: string;
  minRent: number | null;
  floorPlans: ExternalBuildingPropertyFloorPlan[];
  maxRent: number;
  zip: number | null;
  state: string | null;
  city: string | null;
  address: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  cashback: number | null;
  photo: string;
}

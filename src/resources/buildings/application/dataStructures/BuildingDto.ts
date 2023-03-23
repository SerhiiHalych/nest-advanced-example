interface PropertyFloorPlan {
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

export interface FoobarProperty {
  id: string | null;
  name: string | null;
  minRent: number | null;
  floorPlans: PropertyFloorPlan[];
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

export interface BuildingDto {
  id: string;
  name: string;
  address: string;
  data: FoobarProperty;
  externalId: string;
}

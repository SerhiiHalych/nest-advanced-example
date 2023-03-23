export interface ListContactsQueryInput {
  ownerId?: string;
  searchString?: string;
  take: number;
  skip: number;
  filterId?: string;
}

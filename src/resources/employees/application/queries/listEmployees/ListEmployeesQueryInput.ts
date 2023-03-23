export interface ListEmployeesQueryInput {
  take: number | null;
  skip: number | null;
  ownersOnly: boolean;
}

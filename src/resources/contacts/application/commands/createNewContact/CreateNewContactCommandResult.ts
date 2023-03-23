export interface CreateNewContactCommandResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: Date;
  owner: {
    id: string;
    user: {
      id: string;
      givenName: string;
      familyName: string | null;
      picture: string;
    };
  };
}

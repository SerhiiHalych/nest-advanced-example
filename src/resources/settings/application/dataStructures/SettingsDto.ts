export interface SettingsDto {
  google: {
    communicationEmail: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    scope: string | null;
    tokenType: string | null;
    expiryDate: number | null;
  };
  lastGmailHistoryId: string | null;
}

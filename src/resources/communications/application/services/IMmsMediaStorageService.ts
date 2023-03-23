export interface IMmsMediaStorageService {
  uploadMedia(
    files: Array<{
      fileData: Buffer;
      fileName: string;
    }>
  ): Promise<
    Array<{
      url: string;
      key: string;
      contentType: string;
    }>
  >;

  delete(fileNames: string[]): Promise<void>;
}

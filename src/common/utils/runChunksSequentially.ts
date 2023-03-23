import { chunk } from 'lodash';

export const runChunksSequentially = <TArray, TResult>(
  array: TArray[],
  chunkSize: number,
  sequenceCallback: (chunk: TArray[]) => Promise<TResult>
): Promise<TResult[]> => {
  const chunks = chunk(array, chunkSize);

  return chunks.reduce(async (previousPromise, currentChunk) => {
    const previousResult = await previousPromise;

    const chunkCallbackResult = await sequenceCallback(currentChunk);

    return [...previousResult, chunkCallbackResult];
  }, Promise.resolve([] as TResult[]));
};

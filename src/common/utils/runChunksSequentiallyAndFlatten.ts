import * as _ from 'lodash';

export const runChunksSequentiallyAndFlatten = async <TArray, TRetultItem>(
  array: TArray[],
  chunkSize: number,
  sequenceCallback: (chunk: TArray[], index?: number) => Promise<TRetultItem[]>
): Promise<TRetultItem[]> => {
  const chunks = _.chunk(array, chunkSize);

  const result = await chunks.reduce(async (previousPromise, currentChunk, index) => {
    const previousResult = await previousPromise;

    const chunkCallbackResult = await sequenceCallback(currentChunk, index);

    return [...previousResult, chunkCallbackResult];
  }, Promise.resolve([] as TRetultItem[][]));

  return _.flatten(result);
};

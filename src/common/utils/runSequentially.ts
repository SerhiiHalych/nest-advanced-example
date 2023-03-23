export const runSequentially = <TArray, TResult>(
  array: TArray[],
  sequenceCallback: (item: TArray) => TResult | Promise<TResult>
): Promise<TResult[]> => {
  return array.reduce(async (previousPromise, currentItem) => {
    const previousResult = await previousPromise;

    const chunkCallbackResult = await sequenceCallback(currentItem);

    return [...previousResult, chunkCallbackResult];
  }, Promise.resolve([] as TResult[]));
};

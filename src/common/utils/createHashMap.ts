import * as _ from 'lodash';

export const createHashMap = <TArrayElement>(
  array: TArrayElement[],
  iteratee: _.ValueIterateeCustom<TArrayElement, string | number | symbol>
): HashMap<TArrayElement> =>
  _(array)
    .keyBy(iteratee)
    .mapValues(data => data)
    .value();

export type HashMap<TElement> = Record<string, TElement>;

import * as _ from 'lodash';

export const createGroupHashMap = <TArrayElement>(
  array: TArrayElement[],
  iteratee: _.ValueIterateeCustom<TArrayElement, string | number | symbol>
): GroupHashMap<TArrayElement> =>
  _(array)
    .groupBy(iteratee)
    .mapValues(data => data)
    .value();

export type GroupHashMap<TElement> = Record<string, TElement[]>;

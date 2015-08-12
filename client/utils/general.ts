'use strict';

import { List } from 'immutable';

export function moveInList<T>(list: List<T>, itemIndex: number, insertPoint: number): List<T> {
  var n = list.size;
  if (itemIndex < 0 || itemIndex >= n) throw new Error('itemIndex out of range');
  if (insertPoint < 0 || insertPoint > n) throw new Error('insertPoint out of range');
  var newArray: T[] = [];
  list.forEach((value, i) => {
    if (i === insertPoint) newArray.push(list.get(itemIndex));
    if (i !== itemIndex) newArray.push(value);
  });
  if (n === insertPoint) newArray.push(list.get(itemIndex));
  return List(newArray);
}

export function findFirstIndex<T>(array: T[], fn: (x: T) => boolean): number {
  for (var i = 0; i < array.length; i++) {
    var v = array[i];
    if (fn(v)) return i;
  }
  return -1;
}

export function moveInArray<T>(array: T[], itemIndex: number, insertPoint: number): T[] {
  var n = array.length;
  if (itemIndex < 0 || itemIndex >= n) throw new Error('itemIndex out of range');
  if (insertPoint < 0 || insertPoint > n) throw new Error('insertPoint out of range');
  var newArray: T[] = [];
  for (var i = 0; i < n; i++) {
    if (i === insertPoint) newArray.push(array[itemIndex]);
    if (i !== itemIndex) newArray.push(array[i]);
  }
  if (i === insertPoint) newArray.push(array[itemIndex]);
  return newArray;
}

'use strict';

import { List } from 'immutable';
import { arraysEqual } from 'immutable-class';

var objectHasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwnProperty(obj: any, key: string): boolean {
  return objectHasOwnProperty.call(obj, key);
}

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

export function makeTitle(name: string): string {
  return name.replace(/(^|[_\-]+)\w/g, (s) => { // 'hello_world-love' -> 'Hello World Love'
    return s.replace(/[_\-]+/, ' ').toUpperCase();
  }).replace(/[a-z][A-Z]/g, (s) => { // 'HelloWorld' -> 'Hello World'
    return s[0] + ' ' + s[1];
  });
}

export function listsEqual<T>(listA: List<T>, listB: List<T>): boolean {
  if (listA === listB) return true;
  if (!listA || !listB) return false;
  return arraysEqual(listA.toArray(), listB.toArray());
}

export interface DragPosition {
  dragInsertPosition: number;
  dragReplacePosition: number;
}

export function calculateDragPosition(offset: number, numItems: number, itemWidth: number, itemGap: number): DragPosition {
  if (!numItems) {
    return {
      dragInsertPosition: null,
      dragReplacePosition: 0
    };
  }

  if (offset < 0) {
    return {
      dragInsertPosition: 0,
      dragReplacePosition: null
    };
  }

  var sectionWidth = itemWidth + itemGap;
  var sectionNumber = Math.floor(offset / sectionWidth);
  if (sectionNumber > numItems) {
    return {
      dragInsertPosition: null,
      dragReplacePosition: numItems
    };
  }

  var offsetWithinSection = offset - sectionWidth * sectionNumber;
  if (offsetWithinSection < itemWidth) {
    return {
      dragInsertPosition: null,
      dragReplacePosition: sectionNumber
    };
  } else {
    return {
      dragInsertPosition: sectionNumber + 1,
      dragReplacePosition: null
    };
  }
}

export function collect(wait: number, func: Function): Function {
  var timeout: any;
  var later = function() {
    timeout = null;
    func();
  };
  return function() {
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
  };
}

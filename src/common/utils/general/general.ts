/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { List } from 'immutable';
import { immutableArraysEqual, Equalable } from 'immutable-class';
import { TimeRange, NumberRange, PlywoodRange } from 'plywood';

// The most generic function
export interface Fn {
  (): void;
}

var objectHasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwnProperty(obj: any, key: string | number): boolean {
  if (!obj) return false;
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
  return name
    .replace(/^[ _\-]+|[ _\-]+$/g, '')
    .replace(/(^|[_\-]+)\w/g, (s) => { // 'hello_world-love' -> 'Hello World Love'
      return s.replace(/[_\-]+/, ' ').toUpperCase();
    })
    .replace(/[a-z0-9][A-Z]/g, (s) => { // 'HelloWorld' -> 'Hello World'
      return s[0] + ' ' + s[1];
    });
}

export function immutableListsEqual<T extends Equalable>(listA: List<T>, listB: List<T>): boolean {
  if (listA === listB) return true;
  if (!listA !== !listB) return false;
  return immutableArraysEqual(listA.toArray(), listB.toArray());
}

export function collect(wait: number, fn: Fn): Fn {
  var timeout: any;
  var later = function() {
    timeout = null;
    fn();
  };
  return function() {
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
  };
}

const URL_UNSAFE_CHARS = /[^\w.~\-]+/g;

export function makeUrlSafeName(name: string): string {
  return name.replace(URL_UNSAFE_CHARS, '_');
}

export function verifyUrlSafeName(name: string): void {
  if (typeof name !== 'string') throw new TypeError('name must be a string');
  if (!name.length) throw new Error('can not have empty name');
  var urlSafeName = makeUrlSafeName(name);
  if (name !== urlSafeName) {
    throw new Error(`'${name}' is not a URL safe name. Try '${urlSafeName}' instead?`);
  }
}

export function arraySum(inputArray: number[]) {
  return inputArray.reduce((pV: number, cV: number) => {
    return pV + cV;
  }, 0);
}

export function findFirstBiggerIndex<T>(array: T[], elementToFind: T, valueOf: (input: T) => number) {
  if (!elementToFind) return -1;
  return List(array).findIndex(g => valueOf(g) > valueOf(elementToFind));
}

export function findBiggerClosestToIdeal<T>(array: T[], elementToFind: T, ideal: T, valueOf: (input: T) => number) {
  var biggerOrEqualIndex = List(array).findIndex(g => valueOf(g) >= valueOf(elementToFind));
  var biggerArrayOrEqual = array.slice(biggerOrEqualIndex);
  return biggerArrayOrEqual.reduce((pV, cV, i, arr) => Math.abs(valueOf(pV) - valueOf(ideal)) < Math.abs(valueOf(cV) - valueOf(ideal)) ? pV : cV);
}

export function findExactIndex<T>(array: T[], elementToFind: T, valueOf: (input: T) => number) {
  return List(array).findIndex(g => valueOf(g) === valueOf(elementToFind));
}

export function findMaxValueIndex<T>(array: T[], valueOf: (input: T) => number) {
  return array.reduce((currMax, cV, cIdx, arr) => valueOf(cV) > valueOf(arr[currMax]) ? cIdx : currMax, 0);
}

export function findMinValueIndex<T>(array: T[], valueOf: (input: T) => number) {
  return array.reduce((currMax, cV, cIdx, arr) => valueOf(cV) < valueOf(arr[currMax]) ? cIdx : currMax, 0);
}

function log10(n: number) {
  return Math.log(n) * Math.LOG10E;
}

export function toSignificantDigits(n: number, digits: number) {
  var multiplier = Math.pow(10, digits - Math.floor(Math.log(n) / Math.LN10) - 1);
  return Math.round(n * multiplier) / multiplier;
}

export function getNumberOfWholeDigits(n: number) {
  return Math.max(Math.floor(log10(Math.abs(n))), 0) + 1;
}

// replaces things like %{PORT_NAME}% with the value of vs.PORT_NAME
export function inlineVars(obj: any, vs: Lookup<string>): any {
  return JSON.parse(JSON.stringify(obj).replace(/%\{[\w\-]+\}%/g, (varName) => {
    varName = varName.substr(2, varName.length - 4);
    var v = vs[varName];
    if (typeof v !== 'string') throw new Error(`could not find variable '${varName}'`);
    var v = JSON.stringify(v);
    return v.substr(1, v.length - 2);
  }));
}

export function ensureOneOf(value: string, values: string[], messagePrefix: string): void {
  if (values.indexOf(value) !== -1) return;
  var isMessage = typeof value === 'undefined' ? 'not defined' : `'${value}'`;
  throw new Error(`${messagePrefix} must be on of '${values.join("', '")}' (is ${isMessage})`);
}

export function pluralIfNeeded(n: number, thing: string): string {
  return `${n} ${thing}${n === 1 ? '' : 's'}`;
}

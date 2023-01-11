/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Collection, List } from "immutable";

// The most generic function
export type Fn = () => void;

const objectHasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwnProperty(obj: any, key: string | number): boolean {
  if (!obj) return false;
  return objectHasOwnProperty.call(obj, key);
}

export function isNil(obj: unknown): boolean {
  return obj === undefined || obj === null;
}

export function isObject(obj: unknown): obj is object {
  return obj !== null && typeof obj === "object";
}

export function isTruthy(element: unknown): boolean {
  return element !== null && element !== undefined && element !== false;
}

export function isBlank(str: string): boolean {
  return str.length === 0;
}

export function isNumber(n: unknown): n is number {
  return typeof n === "number";
}

export function isFiniteNumber(n: number): boolean {
  return isNumber(n) && isFinite(n) && !isNaN(n);
}

export function moveInList<T>(list: List<T>, itemIndex: number, insertPoint: number): List<T> {
  const n = list.size;
  if (itemIndex < 0 || itemIndex >= n) throw new Error("itemIndex out of range");
  if (insertPoint < 0 || insertPoint > n) throw new Error("insertPoint out of range");
  const newArray: T[] = [];
  list.forEach((value, i) => {
    if (i === insertPoint) newArray.push(list.get(itemIndex));
    if (i !== itemIndex) newArray.push(value);
  });
  if (n === insertPoint) newArray.push(list.get(itemIndex));
  return List(newArray);
}

export function makeTitle(name: string): string {
  return name
    .replace(/^[ _\-]+|[ _\-]+$/g, "")
    .replace(/(^|[_\-]+)\w/g, s => { // 'hello_world-love' -> 'Hello World Love'
      return s.replace(/[_\-]+/, " ").toUpperCase();
    })
    .replace(/[a-z0-9][A-Z]/g, s => { // 'HelloWorld' -> 'Hello World'
      return s[0] + " " + s[1];
    });
}

const URL_UNSAFE_CHARS = /[^\w.~\-]+/g;

export function makeUrlSafeName(name: string): string {
  return name.replace(URL_UNSAFE_CHARS, "_");
}

export function verifyUrlSafeName(name: string): void {
  if (typeof name !== "string") throw new TypeError("name must be a string");
  if (!name.length) throw new Error("can not have empty name");
  const urlSafeName = makeUrlSafeName(name);
  if (name !== urlSafeName) {
    throw new Error(`'${name}' is not a URL safe name. Try '${urlSafeName}' instead?`);
  }
}

export function arraySum(inputArray: number[]) {
  return inputArray.reduce((pV: number, cV: number) => pV + cV, 0);
}

export function findFirstBiggerIndex<T>(array: T[], elementToFind: T, valueOf: (input: T) => number) {
  if (!elementToFind) return -1;
  return List(array).findIndex(g => valueOf(g) > valueOf(elementToFind));
}

export function findBiggerClosestToIdeal<T>(array: T[], elementToFind: T, ideal: T, valueOf: (input: T) => number) {
  const biggerOrEqualIndex = List(array).findIndex(g => valueOf(g) >= valueOf(elementToFind));
  const biggerArrayOrEqual = array.slice(biggerOrEqualIndex);
  return biggerArrayOrEqual.reduce((pV, cV) => Math.abs(valueOf(pV) - valueOf(ideal)) < Math.abs(valueOf(cV) - valueOf(ideal)) ? pV : cV);
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

export function integerDivision(x: number, y: number): number {
  return Math.floor(x / y);
}

export function toSignificantDigits(n: number, digits: number) {
  const multiplier = Math.pow(10, digits - Math.floor(Math.log(n) / Math.LN10) - 1);
  return Math.round(n * multiplier) / multiplier;
}

export function getNumberOfWholeDigits(n: number) {
  return Math.max(Math.floor(log10(Math.abs(n))), 0) + 1;
}

// replaces things like %{PORT_NAME}% with the value of vs.PORT_NAME
export function inlineVars(obj: any, vs: Record<string, string>): any {
  return JSON.parse(JSON.stringify(obj).replace(/%{[\w\-]+}%/g, varName => {
    varName = varName.substr(2, varName.length - 4);
    let v = vs[varName];
    if (typeof v !== "string") throw new Error(`could not find variable '${varName}'`);
    v = JSON.stringify(v);
    return v.substr(1, v.length - 2);
  }));
}

export function ensureOneOf(value: unknown, values: unknown[], messagePrefix: string): void {
  if (values.indexOf(value) !== -1) return;
  const isMessage = isTruthy(value) ? `'${value}'` : "not defined";
  throw new Error(`${messagePrefix} must be one of '${values.join("', '")}' (is ${isMessage})`);
}

export function optionalEnsureOneOf(value: unknown, values: unknown[], messagePrefix: string): void {
  if (!isTruthy(value)) return;
  if (values.indexOf(value) !== -1) return;
  throw new Error(`${messagePrefix} must be one of '${values.join("', '")}' (is '${value}')`);
}

export function pluralIfNeeded(n: number, thing: string): string {
  return `${n} ${thing}${n === 1 ? "" : "s"}`;
}

export function quoteNames(names: Collection.Indexed<string>): string {
  return names.map(name => `'${name}'`).join(", ");
}

export function isDecimalInteger(input: string): boolean {
  return parseInt(input, 10) === Number(input);
}

export function readNumber(input: any): number {
  return typeof input === "number" ? input : parseFloat(input);
}

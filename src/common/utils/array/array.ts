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

export function move(array: any[], oldIndex: number, newIndex: number) {
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
}

export function indexByAttribute(array: any[], key: string, value: string): any {
  if (!array || !array.length) return -1;

  const n = array.length;
  for (let i = 0; i < n; i++) {
    if (array[i][key] === value) return i;
  }

  return -1;
}

export function insert<T>(array: T[], index: number, element: T): T[] {
  return [...array.slice(0, index), element, ...array.slice(index)];
}

export function shallowEqualArrays(a: unknown[], b: unknown[]): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (b.length !== a.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

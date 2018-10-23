/*
 * Copyright 2017-2018 Allegro.pl
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

export function assoc<T, K extends keyof T>(obj: T, key: K, val: T[K]): T {
  return Object.assign({}, obj, { [key]: val });
}

export function pick<T, K extends keyof T>(keys: K[], obj: T): Pick<T, K> {
  return keys.reduce((acc, key) =>
    Object.assign(acc, { [key]: obj[key] }), {} as Pick<T, K>);
}

export function partialSet<T, K extends keyof T>(keys: K[], obj: T, val: Pick<T, K>): T {
  return keys.reduce((acc, key) =>
    Object.assign(acc, { [key]: val[key] }), Object.assign({}, obj));
}

export function setIn(obj: any, path: string[], value: any): any {
  const val = path.length > 1 ? setIn(obj[path[0]], path.slice(1), value) : value;
  return { ...obj, [path[0]]: val };
}

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

import { assoc, Predicate, Unary } from "../functional/functional";
import { isTruthy } from "../general/general";

export function extend(source: any, target: any): any {
  for (const key in source) {
    target[key] = source[key];
  }

  return target;
}

export function omitFalsyValues<T>(obj: T): Partial<T> {
  return pickValues(obj, isTruthy);
}

type Key = string;

export function mapValues<K extends Key, S, T>(obj: Record<K, S>, fn: Unary<S, T>): Record<K, T> {
  return Object.keys(obj).reduce((result: Record<K, T>, key: K) => {
    result[key] = fn(obj[key]);
    return result;
  }, {} as Record<K, T>);
}

export function pickValues<T, K extends keyof T>(obj: T, predicate: Predicate<T[K]>): Partial<T> {
  return (Object.keys(obj) as K[]).reduce((result: Partial<T>, key: K) => {
    const value = obj[key];
    if (predicate(value)) {
      result[key] = value;
    }
    return result;
  }, {} as Partial<T>);
}

export function fromEntries<K extends Key, T>(entries: Array<[K, T]>): Record<K, T> {
  return entries.reduce((result: Record<K, T>, [key, value]: [K, T]) =>
    assoc(result, key, value), {} as Record<K, T>);
}

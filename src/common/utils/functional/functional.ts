/*
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

import { Fn, isTruthy } from "../general/general";

export type RequireOnly<T, K extends keyof T> = Pick<T, K> & Partial<T>;

export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export type Nullary<R> = () => R;
export type Unary<T, R> = (arg: T) => R;
export type Binary<T, T2, R> = (arg: T, arg2: T2) => R;
export type Ternary<T, T2, T3, R> = (arg: T, arg2: T2, arg3: T3) => R;
export type Quaternary<T, T2, T3, T4, R> = (arg: T, arg2: T2, arg3: T3, arg4: T4) => R;

export type Predicate<T> = Unary<T, boolean>;

export function noop(...args: any[]): any {
}

export const identity = <T>(x: T): T => x;

export const constant = <T>(val: T): Nullary<T> => () => val;

export const compose = <A, B, C>(f: Unary<A, B>, g: Unary<B, C>): Unary<A, C> =>
  (x: A) => g(f(x));

export function cons<T>(coll: T[], element: T): T[] {
  return coll.concat([element]);
}

export function assoc<T, K extends string | number | symbol = string>(coll: Record<K, T>, key: K, element: T): Record<K, T> {
  return Object.assign({}, coll, { [key]: element });
}

export function replaceAt<T>(collection: T[], index: number, element: T): T[] {
  return [
    ...collection.slice(0, index),
    element,
    ...collection.slice(index + 1)
  ];
}

export function zip<T, U>(xs: T[], ys: U[]): Array<[T, U]> {
  const length = Math.min(xs.length, ys.length);
  return xs.slice(0, length).map((x, idx) => {
    const y = ys[idx];
    return [x, y] as [T, U];
  });
}

export function flatMap<T, S>(coll: T[], mapper: Binary<T, number, S[]>): S[] {
  return [].concat(...coll.map(mapper));
}

export function cyclicShift<T>(coll: T[], count: number): T[] {
  const n = count % coll.length;
  return coll.slice(n, coll.length).concat(coll.slice(0, n));
}

export function concatTruthy<T>(...elements: T[]): T[] {
  return elements.reduce((result: T[], element: T) => isTruthy(element) ? cons(result, element) : result, []);
}

export function mapTruthy<T, S>(coll: T[], f: Binary<T, number, S>): S[] {
  return coll.reduce((result: S[], element: T, idx: number) => {
    const mapped: S = f(element, idx);
    return isTruthy(mapped) ? cons(result, mapped) : result;
  }, []);
}

export function values<T>(obj: Record<string, T>): T[] {
  return Object.keys(obj).map(k => obj[k]);
}

export function thread(x: any, ...fns: Function[]) {
  return fns.reduce((x, f) => f(x), x);
}

export function threadNullable(x: any, ...fns: Function[]) {
  return fns.reduce((x, f) => isTruthy(x) ? f(x) : x, x);
}

const isCallable = (f: any) => typeof f === "function";

export function threadConditionally(x: any, ...fns: Function[]) {
  return fns.reduce((x, f) => isCallable(f) ? f(x) : x, x);
}

export function complement<T>(p: Predicate<T>): Predicate<T> {
  return (x: T) => !p(x);
}

export function or<T>(...ps: Array<Predicate<T>>): Predicate<T> {
  return (value: T) => ps.reduce((acc, p) => p(value) || acc, false);
}

export function range(from: number, to: number): number[] {
  const result = [];
  let n = from;
  while (n < to) {
    result.push(n);
    n += 1;
  }
  return result;
}

// TODO: fix to use infer on arguments tuple https://stackoverflow.com/a/50014868/1089761
export function debounceWithPromise<T extends (...args: any[]) => Promise<any>>(fn: T, ms: number): ((...args: Parameters<T>) => Promise<any>) & { cancel: Fn } {
  let timeoutId: any;

  const debouncedFn = (...args: Parameters<T>) => {
    let resolve: Function;
    const promise = new Promise(pResolve => {
      resolve = pResolve;
    });
    const callLater = () => {
      timeoutId = undefined;
      resolve(fn(...args));
    };

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(callLater, ms);

    return promise;
  };

  debouncedFn.cancel = () => timeoutId && clearTimeout(timeoutId);

  return debouncedFn;
}

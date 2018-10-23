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

import { assoc, partialSet, pick, setIn } from "./helpers";
import { Lens, Modifier } from "./types";

export function view<S, A>(lens: Lens<S, A>): (obj: S) => A;
export function view<S, A>(lens: Lens<S, A>, obj: S): A;
export function view<S, A>(lens: Lens<S, A>, obj?: S): any {
  return arguments.length === 2 ? lens.get(obj)
    : (obj: S) => lens.get(obj);
}

export function over<S, A>(lens: Lens<S, A>, fn: Modifier<A>): (obj: S) => S;
export function over<S, A>(lens: Lens<S, A>, fn: Modifier<A>, obj: S): S;
export function over<S, A>(lens: Lens<S, A>, fn: Modifier<A>, obj?: S): any {
  return arguments.length === 3 ? lens.set(obj, fn(lens.get(obj)))
    : (obj: S) => lens.set(obj, fn(lens.get(obj)));
}

export function set<S, A>(lens: Lens<S, A>, val: A): (obj: S) => S;
export function set<S, A>(lens: Lens<S, A>, val: A, obj: S): S;
export function set<S, A>(lens: Lens<S, A>, val: A, obj?: S): any {
  return arguments.length === 3 ? lens.set(obj, val)
    : (obj: S) => lens.set(obj, val);
}

export function compose<S, A, B>(lensSA: Lens<S, A>, lensAB: Lens<A, B>): Lens<S, B> {
  return {
    get: (obj: S) =>
      lensAB.get(lensSA.get(obj)),
    set: (obj: S, val: B) =>
      lensSA.set(obj, lensAB.set(lensSA.get(obj), val))
  };
}

export class LensFactory<T> {
  prop<K extends keyof T>(key: K): Lens<T, T[K]> {
    return {
      get: (obj: T) => obj[key],
      set: (obj: T, val: T[K]) => assoc(obj, key, val)
    };
  }

  path<K extends keyof T>(k: K): Lens<T, T[K]>;
  path<K extends keyof T, K2 extends keyof T[K]>(k: K, k2: K2): Lens<T, T[K][K2]>;
  path<K extends keyof T,
    K2 extends keyof T[K],
    K3 extends keyof T[K][K2]>(k: K, k2: K2, k3: K3): Lens<T, T[K][K2][K3]>;
  path<K extends keyof T,
    K2 extends keyof T[K],
    K3 extends keyof T[K][K2],
    K4 extends keyof T[K][K2][K3]>(k: K, k2: K2, k3: K3, k4: K4): Lens<T, T[K][K2][K3][K4]>;
  path(...keys: string[]): Lens<any, any> {
    const get = (obj: any) => keys.reduce((prop, key) => prop[key], obj);
    const set = (obj: any, val: any) => setIn(obj, keys, val);
    return { get, set };
  }

  pick<K extends keyof T>(...keys: K[]): Lens<T, Pick<T, K>> {
    return {
      get: (obj: T) => pick(keys, obj),
      set: (obj: T, val: Pick<T, K>) => partialSet(keys, obj, val)
    };
  }
}

export function of<S>() {
  return new LensFactory<S>();
}

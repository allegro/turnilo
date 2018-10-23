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
import { Record as ImmutableRecord } from "immutable";
import { pick } from "./helpers";
import { Lens } from "./types";

type Record<T> = ImmutableRecord<T> & T;

export class LensFactory<T> {
  prop<K extends keyof T>(key: K): Lens<Record<T>, T[K]> {
    return {
      get: (obj: Record<T>) => obj[key],
      set: (obj: Record<T>, val: T[K]) => obj.set(key, val)
    };
  }

  path<K extends keyof T>(k: K): Lens<Record<T>, T[K]>;
  path<K extends keyof T, K2 extends keyof T[K]>(k: K, k2: K2): Lens<Record<T>, T[K][K2]>;
  path<K extends keyof T,
    K2 extends keyof T[K],
    K3 extends keyof T[K][K2]>(k: K, k2: K2, k3: K3): Lens<Record<T>, T[K][K2][K3]>;
  path<K extends keyof T,
    K2 extends keyof T[K],
    K3 extends keyof T[K][K2],
    K4 extends keyof T[K][K2][K3]>(k: K, k2: K2, k3: K3, k4: K4): Lens<Record<T>, T[K][K2][K3][K4]>;
  path(...keys: string[]): Lens<Record<any>, any> {
    const get = (obj: Record<any>) => obj.getIn(keys);
    const set = (obj: Record<any>, val: any) => obj.setIn(keys, val);
    return { get, set };
  }

  pick<K extends keyof T>(...keys: K[]): Lens<Record<T>, Pick<T, K>> {
    return {
      get: (obj: Record<T>) => pick(keys, obj),
      set: (obj: Record<T>, val: Pick<T, K>) => obj.merge(val as Partial<T>)
    };
  }
}

export function of<S>() {
  return new LensFactory<S>();
}

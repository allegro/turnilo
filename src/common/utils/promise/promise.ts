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

import { Unary } from "../functional/functional";

export function timeout(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`Timed out in ${ms}ms.`);
    }, ms);
  });
}

export class Deferred<T> {
  public readonly promise: Promise<T>;
  public resolve: Unary<T, void>;
  public reject: Unary<unknown, void>;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

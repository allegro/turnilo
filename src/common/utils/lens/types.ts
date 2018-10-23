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

import { Binary, Unary } from "../functional/functional";

export type Getter<S, A> = Unary<S, A>;
export type Setter<S, A> = Binary<S, A, S>;
export type Modifier<T> = Unary<T, T>;

export interface Lens<S, A> {
  get: Getter<S, A>;
  set: Setter<S, A>;
}

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

export interface FunctionSlot<T> {
  (...args: any[]): T;
  fill?: (fn: (...args: any[]) => T) => void;
  clear?: () => void;
}

export function createFunctionSlot<T>(): FunctionSlot<T> {
  var myFn: (...args: any[]) => T;
  var slot: FunctionSlot<T> = (...args: any[]) => {
    if (myFn) return myFn.apply(this, args);
    return undefined;
  };
  slot.fill = (fn: (...args: any[]) => T) => { myFn = fn; };
  slot.clear = () => { myFn = null; };
  return slot;
}

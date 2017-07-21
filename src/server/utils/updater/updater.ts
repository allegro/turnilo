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

import { immutableEqual, Equalable } from 'immutable-class';
import { hasOwnProperty } from '../../../common/utils/general/general';

function getName(thing: any): string {
  return thing.name;
}

function noop() {}

export interface UpdatedOptions<T> {
  key?: (thing: T, index?: number) => string;
  equals?: (thingA: T, thingB: T) => boolean;
  onEnter?: (newThing: T) => void;
  onUpdate?: (newThing: T, oldThing: T) => void;
  onExit?: (oldThing: T) => void;
}

export function updater<T extends Equalable>(oldThings: T[], newThings: T[], updatedOptions: UpdatedOptions<T>): void {
  const key = updatedOptions.key || getName;
  const equals = updatedOptions.equals || immutableEqual;
  const onEnter = updatedOptions.onEnter || noop;
  const onUpdate = updatedOptions.onUpdate || noop;
  const onExit = updatedOptions.onExit || noop;

  var initialByKey: Lookup<T> = {};
  for (var i = 0; i < oldThings.length; i++) {
    var initialThing = oldThings[i];
    var initialThingKey = key(initialThing);
    if (initialByKey[initialThingKey]) throw new Error(`duplicate key '${initialThingKey}'`);
    initialByKey[initialThingKey] = initialThing;
  }

  for (var j = 0; j < newThings.length; j++) {
    var newThing = newThings[j];
    var newThingKey = key(newThing);
    var oldThing = initialByKey[newThingKey];
    if (oldThing) {
      if (!equals(newThing, oldThing)) {
        onUpdate(newThing, oldThing);
      }
      delete initialByKey[newThingKey];
    } else {
      onEnter(newThing);
    }
  }

  for (var k in initialByKey) {
    if (!hasOwnProperty(initialByKey, k)) continue;
    onExit(initialByKey[k]);
  }
}

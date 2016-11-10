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

// Shamelessly stolen from http://stackoverflow.com/a/10006499
// (well, traded for an upvote)
export const IP_REGEX = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;

export const NUM_REGEX = /^\d+$/;


export function firstUp(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : undefined;
}

export function pad(n: number, padding = 3): string {
  var str = String(n);

  if (str.length > padding) return str;

  while (str.length < padding) str = '0' + str;

  return str;
}

export function generateUniqueName(prefix: string, isUnique: (name: string) => boolean) {
  var i = 0;

  var name = prefix + pad(i);

  while (!isUnique(name)) {
    name = prefix + pad(++i);
  }

  return name;
}

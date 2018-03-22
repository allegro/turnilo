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

import { compressToBase64, decompressFromBase64 } from "lz-string";

export function arrayToHash(array: string[]): string {
  const concatenated = array
    .map((element) => JSON.stringify(element || null))
    .join(",");

  return compressToBase64(concatenated);
}

export function objectToHash(anyObject: any): string {
  return compressToBase64(JSON.stringify(anyObject));
}

export function hashToArray(hash: string): any[] {
  var jsArray: any[] = null;
  try {
    const decompressed = decompressFromBase64(hash);
    jsArray = JSON.parse('[' + decompressed + ']');
  } catch (e) {
    return null;
  }

  if (!Array.isArray(jsArray)) return null;

  return jsArray;
}

export function hashToObject(hash: string): any {
  try {
    return JSON.parse(decompressFromBase64(hash));
  } catch (e) {
    return null;
  }
}

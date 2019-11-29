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

import { compressToBase64, decompressFromBase64 } from "lz-string";

export function arrayToHash(array: string[]): string {
  const concatenated = array
    .map(element => JSON.stringify(element || null))
    .join(",");

  return compressToBase64(concatenated);
}

export function objectToHash(anyObject: any): string {
  return compressToBase64(JSON.stringify(anyObject));
}

export function hashToArray(hash: string): any[] {
  const decompressed = decompressFromBase64(hash);
  const jsArray = JSON.parse("[" + decompressed + "]");

  if (!Array.isArray(jsArray)) {
    throw new Error("Decoded hash should be an array.");
  }

  return jsArray;
}

export function hashToObject(hash: string): any {
  const jsObject = JSON.parse(decompressFromBase64(hash));

  if (!jsObject || jsObject.constructor !== Object) {
    throw new Error("Decoded hash should be an object.");
  }

  return jsObject;
}

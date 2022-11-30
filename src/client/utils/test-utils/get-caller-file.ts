/*
 * Copyright 2015-2016 Imply Data, Inc.
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

function getStack(): any[] {
  const ErrorConstructor = Error as any;

  const origPrepareStackTrace = ErrorConstructor.prepareStackTrace;

  ErrorConstructor.prepareStackTrace = (_: any, stack: any) => stack;

  const err = new Error() as any;
  const stack = err["stack"] as any[];
  ErrorConstructor.prepareStackTrace = origPrepareStackTrace;
  stack.shift(); // getStack --> Error

  return stack;
}

export function getCallerFile() {
  const stack = getStack();

  stack.shift(); // getCaller --> getStack
  stack.shift(); // caller of getCaller --> getCaller

  return stack[0].getFileName();
}

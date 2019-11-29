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

import { captureException, init as initSentry } from "@sentry/browser";

let isInitialised = false;

export function reportError(error: Error): string | null {
  if (!isInitialised) {
    console.error(error);
    return null;
  }
  return captureException(error);
}

export function init(dsn: string, release: string) {
  initSentry({ dsn, release });
  isInitialised = true;
}

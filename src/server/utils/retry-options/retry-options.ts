/*
 * Copyright 2017-2021 Allegro.pl
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

import { Record } from "immutable";

interface RetryOptionsValue {
  maxAttempts: number;
  delay: number;
}

export interface RetryOptionsJS {
  maxAttempts: number;
  delay: number;
}

const defaultRetryOptions: RetryOptionsValue = {
  delay: 5000,
  maxAttempts: 5
};

export class RetryOptions extends Record<RetryOptionsValue>(defaultRetryOptions) {

  static fromJS(options: RetryOptionsJS): RetryOptions {
    return new RetryOptions(options);
  }
}

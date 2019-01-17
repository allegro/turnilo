/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { concurrentLimitRequesterFactory, retryRequesterFactory, verboseRequesterFactory } from "plywood";
import { PlywoodRequester } from "plywood-base-api";
import { DruidRequestDecorator, druidRequesterFactory, Protocol } from "plywood-druid-requester";
import { SupportedType } from "../../../common/models/cluster/cluster";
import { threadConditionally } from "../../../common/utils/functional/functional";

export interface ProperRequesterOptions {
  type: SupportedType;
  host: string;
  retry?: number;
  timeout?: number;
  verbose?: boolean;
  concurrentLimit?: number;

  // Specific to type 'druid'
  druidRequestDecorator?: DruidRequestDecorator;
  protocol?: Protocol;

  // Specific to SQL drivers
  database?: string;
  user?: string;
  password?: string;
}

function createRequester({ type, host, timeout, druidRequestDecorator, protocol }: ProperRequesterOptions): PlywoodRequester<any> {
  switch (type) {
    case "druid":
      return druidRequesterFactory({
        host,
        timeout,
        requestDecorator: druidRequestDecorator,
        protocol
      });
    default:
      throw new Error(`unknown requester type ${type}`);
  }
}

function setRetryOptions(retry: number) {
  return (requester: PlywoodRequester<any>) => retryRequesterFactory({ requester, retry, delay: 500, retryOnTimeout: false });
}

function setVerbose(requester: PlywoodRequester<any>) {
  return verboseRequesterFactory({ requester });
}

function setConcurrencyLimit(concurrentLimit: number) {
  return (requester: PlywoodRequester<any>) => concurrentLimitRequesterFactory({ requester, concurrentLimit });
}

export function properRequesterFactory(options: ProperRequesterOptions): PlywoodRequester<any> {
  const { retry, verbose, concurrentLimit } = options;

  return threadConditionally(
    createRequester(options),
    retry && setRetryOptions(retry),
    verbose && setVerbose,
    concurrentLimit && setConcurrencyLimit(concurrentLimit)
  );
}

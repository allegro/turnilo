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

import { concurrentLimitRequesterFactory, retryRequesterFactory, verboseRequesterFactory } from "plywood";
import { PlywoodRequester } from "plywood-base-api";
import { DruidRequestDecorator, druidRequesterFactory } from "plywood-druid-requester";
import { URL } from "url";
import { Cluster } from "../../../common/models/cluster/cluster";
import { threadConditionally } from "../../../common/utils/functional/functional";
import { RetryOptions } from "../retry-options/retry-options";

export interface ProperRequesterOptions {
  cluster: Cluster;
  verbose?: boolean;
  concurrentLimit?: number;
  druidRequestDecorator?: DruidRequestDecorator;
}

type PlywoodProtocol = "plain" | "tls";

function httpToPlywoodProtocol(protocol: string): PlywoodProtocol {
  if (protocol === "https:") return "tls";
  return "plain";
}

function defaultPort(protocol: string): number {
  switch (protocol) {
    case "http:":
      return 80;
    case "https:":
      return 443;
    default:
      throw new Error(`Unsupported protocol: ${protocol}`);
  }
}

function getHostAndProtocol(url: URL): { host: string, protocol: PlywoodProtocol } {
  const { protocol, port, hostname } = url;
  const plywoodProtocol = httpToPlywoodProtocol(protocol);
  return {
    protocol: plywoodProtocol,
    host: `${hostname}:${port || defaultPort(protocol)}`
  };
}

function createDruidRequester(cluster: Cluster, requestDecorator?: DruidRequestDecorator): PlywoodRequester<any> {
  const { host, protocol } = getHostAndProtocol(new URL(cluster.url));
  return druidRequesterFactory({ host, requestDecorator, protocol });
}

function setRetryOptions({ maxAttempts, delay }: RetryOptions) {
  return (requester: PlywoodRequester<any>) => retryRequesterFactory({
    requester,
    retry: maxAttempts,
    delay,
    retryOnTimeout: true
  });
}

function setVerbose(requester: PlywoodRequester<any>) {
  return verboseRequesterFactory({ requester });
}

function setConcurrencyLimit(concurrentLimit: number) {
  return (requester: PlywoodRequester<any>) => concurrentLimitRequesterFactory({ requester, concurrentLimit });
}

export function properRequesterFactory(options: ProperRequesterOptions): PlywoodRequester<any> {
  const { cluster, druidRequestDecorator, verbose, concurrentLimit } = options;
  return threadConditionally(
    createDruidRequester(cluster, druidRequestDecorator),
    cluster.retry && setRetryOptions(cluster.retry),
    verbose && setVerbose,
    concurrentLimit && setConcurrencyLimit(concurrentLimit)
  );
}

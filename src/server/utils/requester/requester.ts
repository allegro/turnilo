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
import { DruidRequestDecorator, druidRequesterFactory } from "plywood-druid-requester";
import { Cluster } from "../../../common/models/cluster/cluster";
import { threadConditionally } from "../../../common/utils/functional/functional";

export interface ProperRequesterOptions {
  cluster: Cluster;
  retry?: number;
  verbose?: boolean;
  concurrentLimit?: number;
  druidRequestDecorator?: DruidRequestDecorator;
}

function httpToPlywoodProtocol(protocol: string): "plain" | "tls" {
  if (protocol === "https:") return "tls";
  return "plain";
}

function defaultPorts(url: URL): URL {
  if (url.port) return url;
  if (url.protocol === "http:") {
    const newUrl = new URL(url.toString());
    newUrl.port = "80";
    return newUrl;
  }
  if (url.protocol === "https:") {
    const newUrl = new URL(url.toString());
    newUrl.port = "443";
    return newUrl;
  }
  return url;
}

function createDruidRequester(cluster: Cluster, druidRequestDecorator: DruidRequestDecorator): PlywoodRequester<any> {
  const { href, protocol } = defaultPorts(new URL(cluster.url));
  const timeout = cluster.getTimeout();
  return druidRequesterFactory({
    host: href,
    timeout,
    requestDecorator: druidRequestDecorator,
    protocol: httpToPlywoodProtocol(protocol)
  });
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
  const { cluster, druidRequestDecorator, retry, verbose, concurrentLimit } = options;
  return threadConditionally(
    createDruidRequester(cluster, druidRequestDecorator),
    retry && setRetryOptions(retry),
    verbose && setVerbose,
    concurrentLimit && setConcurrencyLimit(concurrentLimit)
  );
}

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

import { Request, Response, Router } from "express";
import * as request from "request-promise-native";
import { LOGGER } from "../../../common/logger/logger";
import { Cluster } from "../../../common/models/cluster/cluster";
import { SourcesGetter } from "../../utils/settings-manager/settings-manager";

const unhealthyHttpStatus = 503;
const healthyHttpStatus = 200;

enum ClusterHealthStatus {
  healthy = "healthy",
  unhealthy = "unhealthy"
}

const statusToHttpStatus = (status: ClusterHealthStatus): number => {
  switch (status) {
    case ClusterHealthStatus.healthy:
      return healthyHttpStatus;
    case ClusterHealthStatus.unhealthy:
      return unhealthyHttpStatus;
  }
};

interface ClusterHealth {
  url: string;
  status: ClusterHealthStatus;
  message: string;
}

async function checkDruidCluster(cluster: Cluster): Promise<ClusterHealth> {
  const { url } = cluster;
  const loadStatusUrl = `${url}/druid/broker/v1/loadstatus`;

  try {
    const { inventoryInitialized } = await request
      .get(loadStatusUrl, { json: true, timeout: cluster.healthCheckTimeout })
      .promise();
    if (!inventoryInitialized) {
      return { url, status: ClusterHealthStatus.unhealthy, message: "inventory not initialized" };
    }
    return { url, status: ClusterHealthStatus.healthy, message: "" };
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "unknown";
    return { url, status: ClusterHealthStatus.unhealthy, message: `connection error: '${message}'` };
  }
}

function checkClusters(clusters: Cluster[]): Promise<ClusterHealth[]> {
  const promises = clusters
    .filter(cluster => (cluster.type === "druid"))
    .map(checkDruidCluster);

  return Promise.all(promises);
}

function aggregateHealthStatus(clusterHealths: ClusterHealth[]): ClusterHealthStatus {
  const isSomeUnhealthy = clusterHealths.some(cluster => cluster.status === ClusterHealthStatus.unhealthy);
  return isSomeUnhealthy ? ClusterHealthStatus.unhealthy : ClusterHealthStatus.healthy;
}

function logUnhealthy(clusterHealths: ClusterHealth[]): void {
  const unhealthyClusters = clusterHealths.filter(({ status }) => status === ClusterHealthStatus.unhealthy);
  unhealthyClusters.forEach(({ message, url }: ClusterHealth) => {
    LOGGER.log(`Unhealthy cluster url: ${url}. Message: ${message}`);
  });
}

export function readinessRouter(getSources: SourcesGetter) {

  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const sources = await getSources();
      const clusterHealths = await checkClusters(sources.clusters);
      logUnhealthy(clusterHealths);
      const overallHealthStatus = aggregateHealthStatus(clusterHealths);
      const httpState = statusToHttpStatus(overallHealthStatus);
      res.status(httpState).send({ status: overallHealthStatus, clusters: clusterHealths });
    } catch (reason) {
      LOGGER.log(`Readiness check error: ${reason.message}`);
      res.status(unhealthyHttpStatus).send({ status: ClusterHealthStatus.unhealthy, message: reason.message });
    }
  });

  return router;
}

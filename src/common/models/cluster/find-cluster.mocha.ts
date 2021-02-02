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

import { expect } from "chai";
import { DataCubeFixtures } from "../data-cube/data-cube.fixtures";
import { Cluster } from "./cluster";
import { ClusterFixtures } from "./cluster.fixtures";
import { findCluster } from "./find-cluster";

const wikiCluster = Cluster.fromJS(ClusterFixtures.druidWikiClusterJS());
const twitterCluster = Cluster.fromJS(ClusterFixtures.druidTwitterClusterJS());

const clusters = [
  wikiCluster,
  twitterCluster
];

describe("findCluster", () => {
  it("should return undefined for native cluster", () => {
    const nativeDataCube = {
      clusterName: "native",
      name: "native_cube",
      source: "native"
    };
    const cluster = findCluster(nativeDataCube, clusters);
    expect(cluster).to.be.undefined;
  });

  it("should return cluster for non-native data cube", () => {
    const wikiDataCube = DataCubeFixtures.WIKI_JS;
    const cluster = findCluster(wikiDataCube, clusters);
    expect(cluster).to.be.equal(wikiCluster);
  });

  it("should throw for non-existing cluster", () => {
    const weirdDataCube = {
      clusterName: "foobar",
      name: "weird_cluster",
      source: "foobar"
    };
    expect(() => findCluster(weirdDataCube, clusters)).to.throw("Can not find cluster");
  });
});

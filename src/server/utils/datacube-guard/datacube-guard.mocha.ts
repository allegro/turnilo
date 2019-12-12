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

import { expect } from "chai";
import { Request } from "express";
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";
import { allowDataCubesHeaderName, checkAccess } from "./datacube-guard";

function mockHeaders(allowedDataCubes: string): Request["headers"] {
  return { [allowDataCubesHeaderName]: allowedDataCubes } as Request["headers"];
}

describe("Guard test", () => {

  it("Guard off -> header for cube A and accessing cube B", () => {
    let dataCubeB = DataCubeFixtures.customCubeWithGuard();
    dataCubeB.name = "cubeB";
    dataCubeB.cluster.guardDataCubes = false;
    expect(checkAccess(dataCubeB, mockHeaders("cubeA"))).to.equal(true);
  });

  it("Guard off -> access to all dataCubes", () => {
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    dataCube.cluster.guardDataCubes = false;
    expect(checkAccess(dataCube, mockHeaders(""))).to.equal(true);
  });

  it("Guard on -> access denied", () => {
    expect(checkAccess(DataCubeFixtures.customCubeWithGuard(), mockHeaders(""))).to.equal(false);
  });

  it("Guard on -> access denied", () => {
    expect(checkAccess(DataCubeFixtures.customCubeWithGuard(), mockHeaders("some,name"))).to.equal(false);
  });

  it("Guard on -> access allowed: wildchar", () => {
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    expect(checkAccess(dataCube, mockHeaders("*,some-other-name"))).to.equal(true);
  });

  it("Guard on -> access allowed: datacube allowed", () => {
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    expect(checkAccess(dataCube, mockHeaders("some-name,some-other-name"))).to.equal(true);
  });
});

/*
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

import { expect } from "chai";
import { Request } from "express";
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";
import { checkAccess } from "./datacube-guard";

describe("Guard test", () => {

  it("Guard off -> header for cube A and accessing cube B", () => {
    let dataCubeB = DataCubeFixtures.customCubeWithGuard();
    dataCubeB.name = "cubeB";
    dataCubeB.cluster.guardDataCubes = false;
    let req = <Request>{};
    req.headers = {"x-turnilo-allow-datacubes": "cubeA"};
    expect(checkAccess(dataCubeB, req)).to.equal(true);
  });

  it("Guard off -> access to all dataCubes", () => {
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    dataCube.cluster.guardDataCubes = false;
    let req = <Request>{};
    expect(checkAccess(dataCube, req)).to.equal(true);
  });

  it("Guard on -> access denied", () => {
    let req = <Request>{};
    expect(checkAccess(DataCubeFixtures.customCubeWithGuard(), req)).to.equal(false)
  });

  it("Guard on -> access denied", () => {
    let req = <Request>{};
    req.headers = {"x-turnilo-allow-datacubes": "some,name"};
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    expect(checkAccess(dataCube, req)).to.equal(false);
  });

  it("Guard on -> access allowed: wildchar", () => {
    let req = <Request>{};
    req.headers = {"x-turnilo-allow-datacubes": "*,some-other-name"};
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    expect(checkAccess(dataCube, req)).to.equal(true);
  });

  it("Guard on -> access allowed: datacube allowed", () => {
    let req = <Request>{};
    req.headers = {"x-turnilo-allow-datacubes": "some-name,some-other-name"};
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    expect(checkAccess(dataCube, req)).to.equal(true);
  });
});

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

import { DataCube } from "../../../common/models/data-cube/data-cube";
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";
import { mockReq } from "../request/request.fixtures";
import { checkAccess } from "./datacube-guard";

const assert = require("assert");

describe("Guard test", () => {

  it("Guard off -> header for cube A and accessing cube B", () => {
    let dataCubeB = DataCubeFixtures.customCubeWithGuard();
    dataCubeB.name = "cubeB";
    dataCubeB.cluster.guardDataCubes = false;
    let req = mockReq();
    req.headers["x-turnilo-allow-datacubes"] = "cubeA";
    assert.equal(checkAccess(dataCubeB, req), true);
  });

  it("Guard off -> access to all dataCubes", () => {
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    dataCube.cluster.guardDataCubes = false;
    assert.equal(checkAccess(dataCube, mockReq()), true);
  });

  it("Guard on -> access denied", () => {
    assert.equal(checkAccess(DataCubeFixtures.customCubeWithGuard(), mockReq()), false);
  });

  it("Guard on -> access denied", () => {
    let req = mockReq();
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    req.headers["x-turnilo-allow-datacubes"] = "some,name";
    assert.equal(checkAccess(dataCube, req), false);
  });

  it("Guard on -> access allowed: wildchar", () => {
    let req = mockReq();
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    req.headers["x-turnilo-allow-datacubes"] = "*,some-other-name";
    assert.equal(checkAccess(dataCube, req), true);
  });

  it("Guard on -> access allowed: datacube allowed", () => {
    let req = mockReq();
    let dataCube = DataCubeFixtures.customCubeWithGuard();
    req.headers["x-turnilo-allow-datacubes"] = "some-name,some-other-name";
    assert.equal(checkAccess(dataCube, req), true);
  });
});

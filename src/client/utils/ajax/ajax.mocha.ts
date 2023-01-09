/*
 * Copyright 2017-2022 Allegro.pl
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

import axios from "axios";
import { expect } from "chai";
import * as sinon from "sinon";
import { Ajax } from "./ajax";

describe("Ajax", () => {
  let get: sinon.SinonStub;

  beforeEach(() => {
    get = sinon.stub(axios, "get");
    get.withArgs("sources/dataCubes?page=0")
      .resolves({ data: { dataCubes: ["first-cube", "second-cube"], next: 1 } });
    get.withArgs("sources/dataCubes?page=1")
      .resolves({ data: { dataCubes: ["third-cube", "fourth-cube"], next: 2 } });
    get.withArgs("sources/dataCubes?page=2")
      .resolves({ data: { dataCubes: ["fifth-cube", "sixth-cube"], next: 3 } });
    get.withArgs("sources/dataCubes?page=3")
      .resolves({ data: { dataCubes: ["last-cube"] } });
  });

  afterEach(() => {
    get.restore();
  });

  describe("fetchDataCubes", () => {
    it("should work", async () => {
      const dataCubes = await Ajax.fetchDataCubes({});
      expect(dataCubes).to.be.deep.equal([
        "first-cube",
        "second-cube",
        "third-cube",
        "fourth-cube",
        "fifth-cube",
        "sixth-cube",
        "last-cube"
      ]);
    });
  });
});

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

import { expect } from "chai";
import { Request } from "express";
import * as sinon from "sinon";
import { wikiCubeWithExecutor } from "../../../common/models/data-cube/data-cube.fixtures";
import { Sources } from "../../../common/models/sources/sources";
import * as DataCubeGuardModule from "../datacube-guard/datacube-guard";
import { parseDataCube } from "./parse-data-cube";

const RESTRICTED_PATHS = [
  "/plywood",
  "/query/visualization",
  "/query/raw-data"
];

const NON_RESTRICTED_PATHS = [
  "/mkurl"
];

const settings = ({
  getSources: (): Promise<Sources> => Promise.resolve({
    clusters: [wikiCubeWithExecutor.cluster],
    dataCubes: [wikiCubeWithExecutor]
  })
});

describe("parseDataCube", () => {
  describe("verifyAccess", () => {
    let checkAccess: sinon.SinonStub;

    beforeEach(() => {
      checkAccess = sinon.stub(DataCubeGuardModule, "checkAccess").returns(true);
    });

    afterEach(() => {
      checkAccess.restore();
    });

    const mockRequest = (path: string, dataCube: string): Request => {
      return {
        path,
        body: {
          dataCube
        },
        headers: "headers"
      } as unknown as Request;
    };

    describe("with guard = true", () => {
      RESTRICTED_PATHS.forEach(path => {
        it(`should call checkAccess on ${path} path`, async () => {
          const req = mockRequest(path, "wiki");
          await parseDataCube(req, settings);

          expect(checkAccess.calledWith(wikiCubeWithExecutor, "headers")).to.be.true;
        });
      });

      NON_RESTRICTED_PATHS.forEach(path => {
        it(`should not call checkAccess on ${path} and return cube`, async () => {
          const req = mockRequest(path, "wiki");
          const dataCube = await parseDataCube(req, settings);

          expect(dataCube).to.be.deep.equal(wikiCubeWithExecutor);
          expect(checkAccess.called).to.be.false;
        });
      });
    });
  });
});

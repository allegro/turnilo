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
import { serialize, SerializedDataCube } from "../../../common/models/data-cube/data-cube";
import { twitterDataCube } from "../../../common/models/data-cube/data-cube.fixtures";
import { getDataCubesPage, getPageNumber } from "./pagination";

const DATA_CUBE: SerializedDataCube = serialize(twitterDataCube);

const nCubes = (n: number) => Array.from({ length: n }).map(() => DATA_CUBE);

describe("DataCube Pagination", () => {
  describe("getPageNumber", () => {
    it("should parse string", () => {
      expect(getPageNumber("10")).to.be.equal(10);
    });

    it("should return default 0 if empty", () => {
      expect(getPageNumber(undefined)).to.be.equal(0);
    });

    describe("URLSearchQuery types", () => {
      it("should return default 0 if passed an array", () => {
        expect(getPageNumber(["foobar", "bazz"])).to.be.equal(0);
      });

      it("should return default 0 if passed an object", () => {
        expect(getPageNumber({ foobar: 42 })).to.be.equal(0);
      });
    });
  });

  describe("getDataCubesPage", () => {
    describe("DataCubes fit into first page", () => {
      const cubes = nCubes(50);

      it("should return all data cubes", () => {
        expect(getDataCubesPage(cubes, 0).dataCubes).to.have.length(50);
      });

      it("should return empty next page", () => {
        expect(getDataCubesPage(cubes, 0).next).to.be.undefined;
      });
    });

    describe("DataCubes does not fit into first page", () => {
      const cubes = nCubes(1500);

      describe("first page", () => {
        it("should return first thousand data cubes", () => {
          expect(getDataCubesPage(cubes, 0).dataCubes).to.have.length(1000);
        });

        it("should return index of next page", () => {
          expect(getDataCubesPage(cubes, 0).next).to.be.equal(1);
        });
      });

      describe("second page", () => {
        it("should return first thousand data cubes", () => {
          expect(getDataCubesPage(cubes, 1).dataCubes).to.have.length(500);
        });

        it("should return empty next page", () => {
          expect(getDataCubesPage(cubes, 1).next).to.be.undefined;
        });
      });
    });

  });

});

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
import { Dataset } from "plywood";
import { error, loaded, loading } from "../../../../common/models/visualization-props/visualization-props";
import { range } from "../../../../common/utils/functional/functional";
import { tileStyles } from "./tile-styles";

const minimalMaxHeight = 148;

const datasetWithNRows = (n: number) =>
  new Dataset({ attributes: [], data: Array.from({ length: n }) });

describe("tileStyles", () => {
  it("should return minimal maxHeight for loading dataset", () => {
    expect(tileStyles(loading)).to.include({ maxHeight: minimalMaxHeight });
  });

  it("should return minimal maxHeight for errored dataset", () => {
    const erroredDataset = error(new Error("foobar"));
    expect(tileStyles(erroredDataset)).to.include({ maxHeight: minimalMaxHeight });
  });

  it("should return minimal maxHeight for dataset with less than 5 rows", () => {
    range(0, 5).forEach(n => {
      const datasetLoaded = loaded(datasetWithNRows(n));
      expect(tileStyles(datasetLoaded)).to.include({ maxHeight: minimalMaxHeight });
    });
  });

  it("should return correct maxHeight for every dataset length otherwise", () => {
    const datasetLoaded = loaded(datasetWithNRows(8));
    expect(tileStyles(datasetLoaded)).to.include({ maxHeight: 248 });
  });
});

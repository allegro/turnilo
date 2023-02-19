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

import { EMPTY_SERIES, SeriesList } from "../../../models/series-list/series-list";
import { measureSeries, quantileSeries } from "../../../models/series/series.fixtures";
import { mockEssence } from "../../test/essence.fixture";
import { mockViewDefinition } from "../../test/view-definition.fixture";
import { fromReference, quantileSeriesDefinition } from "../series-definition.fixtures";
import { assertConversionToEssence } from "./utils";

describe("PinnedSort", () => {
  it("reads pinned sort", () => {
    assertConversionToEssence(
      mockViewDefinition({ pinnedSort: "sum" }),
      mockEssence({ pinnedSort: "sum" })
    );
  });

  it("reads pinned sort as key of complex series", () => {
    assertConversionToEssence(
      mockViewDefinition({
        series: [quantileSeriesDefinition("quantile", 90)],
        pinnedSort: "quantile__p90"
      }),
      mockEssence({
        series: SeriesList.fromSeries([quantileSeries("quantile", 90)]),
        pinnedSort: "quantile__p90"
      })
    );
  });

  it("reverts to default pinned sort when series does not exist", () => {
    assertConversionToEssence(
      mockViewDefinition({ pinnedSort: "foobar" }),
      mockEssence({ pinnedSort: "count" })
    );
  });

  it("reverts to first available series when pinned sort series is not used", () => {
    assertConversionToEssence(
      mockViewDefinition({
        series: [fromReference("sum")],
        pinnedSort: "count"
      }),
      mockEssence({
        series: SeriesList.fromSeries([measureSeries("sum")]),
        pinnedSort: "sum"
      })
    );
  });

  it("reverts to default pinned sort when no series is used", () => {
    assertConversionToEssence(
      mockViewDefinition({
        series: [],
        pinnedSort: "sum"
      }),
      mockEssence({
        series: EMPTY_SERIES,
        pinnedSort: "count"
      })
    );
  });

  it("does not recognize periods inside pinned sort key (sort only on current period)", () => {
    assertConversionToEssence(
      mockViewDefinition({
        series: [fromReference("sum")],
        pinnedSort: "__previous_sum"
      }),
      mockEssence({
        series: SeriesList.fromSeries([measureSeries("sum")]),
        pinnedSort: "sum"
      })
    );
  });
});

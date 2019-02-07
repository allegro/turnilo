/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import * as d3 from "d3";
import * as moment from "moment-timezone";
import * as React from "react";
import { pickTimeFormatter } from "./line-chart-axis";

const start = moment(new Date(0));
const hoursAfter = (hs: number) => moment(new Date(hs * 1000 * 60 * 60));
const scaleWithHoursAfter = (hs: number) =>
  d3.time.scale().range([0, 100]).domain([start.toDate(), hoursAfter(hs).toDate()]);

describe("LineChartAxis", () => {
  describe("pickTimeFormatter", () => {
    it("should format across different years", () => {
      const formatter = pickTimeFormatter(scaleWithHoursAfter(24 * 365 * 3));

      expect(formatter(start)).to.equal(start.format("YYYY-MM-DD"));
    });
    it("should format across different months", () => {
      const formatter = pickTimeFormatter(scaleWithHoursAfter(24 * 30 * 2));

      expect(formatter(start)).to.equal(start.format("MMM DD"));
    });
    it("should format when days differ by one", () => {
      const formatter = pickTimeFormatter(scaleWithHoursAfter(24));

      expect(formatter(start)).to.equal(start.format("dd DD, HH"));
    });
    it("should format across different days", () => {
      const formatter = pickTimeFormatter(scaleWithHoursAfter(24 * 5));

      expect(formatter(start)).to.equal(start.format("dd DD"));
    });
    it("should format across different hours", () => {
      const formatter = pickTimeFormatter(scaleWithHoursAfter(12));

      expect(formatter(start)).to.equal(start.format("HH"));
    });
    it("should format with smaller than hour difference", () => {
      const formatter = pickTimeFormatter(scaleWithHoursAfter(0.2));

      expect(formatter(start)).to.equal(start.format("HH:mm"));
    });
    it("should format correctly with not enough ticks", () => {
      const formatter = pickTimeFormatter(scaleWithHoursAfter(0));

      expect(formatter(start)).to.equal(start.format("YYYY-MM-DD HH:mm"));
    });
  });
});

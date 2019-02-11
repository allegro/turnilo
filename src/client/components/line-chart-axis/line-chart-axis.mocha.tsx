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
import { pickFormatDefinition } from "./line-chart-axis";

const start = moment(new Date(0));
const hoursAfter = (hs: number) => moment(new Date(hs * 1000 * 60 * 60));
const scaleWithHoursAfter = (hs: number) =>
  d3.time.scale().range([0, 100]).domain([start.toDate(), hoursAfter(hs).toDate()]);

describe("LineChartAxis", () => {
  describe("pickFormatDefinition", () => {
    it("should format across different years", () => {
      expect(pickFormatDefinition(scaleWithHoursAfter(24 * 365 * 3))).to.equal("D MMM YYYY");
    });
    it("should format across different months", () => {
      expect(pickFormatDefinition(scaleWithHoursAfter(24 * 30 * 2))).to.equal("D MMM");
    });
    it("should format when days differ by one", () => {
      expect(pickFormatDefinition(scaleWithHoursAfter(24))).to.equal("D H:mm");
    });
    it("should format across different days", () => {
      expect(pickFormatDefinition(scaleWithHoursAfter(24 * 5))).to.equal("dd D");
    });
    it("should format across different hours", () => {
      expect(pickFormatDefinition(scaleWithHoursAfter(12))).to.equal("H:mm");
    });
    it("should format with smaller than hour difference", () => {
      expect(pickFormatDefinition(scaleWithHoursAfter(0.2))).to.equal("H:mm");
    });
    it("should format correctly with not enough ticks", () => {
      expect(pickFormatDefinition(scaleWithHoursAfter(0))).to.equal("D MMM YYYY H:mm");
    });
  });
});

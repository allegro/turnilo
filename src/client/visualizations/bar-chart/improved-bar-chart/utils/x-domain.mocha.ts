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
import { Split } from "../../../../../common/models/split/split";
import { BarChartModel } from "./bar-chart-model";
import { getXDomain } from "./x-domain";

describe("getXDomain", () => {
  const model = { continuousSplit: new Split({ reference: "foobar" }) } as any as BarChartModel;
  const datums = [
    { foobar: 1, bazz: 42 },
    { foobar: 65, bazz: 1, qvux: 42 },
    { foobar: "dummy", qvux: 3 }
  ];

  it("should pick split values from datums", () => {
    const domain = getXDomain(datums, model);
    expect(domain).to.be.deep.equal([1, 65, "dummy"]);
  });
});

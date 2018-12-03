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
import { testImmutableClass } from "immutable-class-tester";

import { AttributeInfo } from "plywood";
import { Measure, MeasureJS } from "./measure";
import { MeasureFixtures } from "./measure.fixtures";

describe("Measure", () => {
  it("is an immutable class", () => {
    testImmutableClass<MeasureJS>(Measure, [
      {
        name: "price",
        title: "Price",
        formula: "$main.sum($price)"
      },
      {
        name: "avg_price",
        title: "Average Price",
        formula: "$main.average($price)"
      },
      {
        name: "latency",
        title: "Latency",
        units: "ms",
        formula: "$main.sum($latency)"
      },
      {
        name: "item_sum",
        title: "Items",
        formula: "$main.sum($item)"
      }
    ]);
  });

  describe("back compat", () => {
    it("upgrades expression to formula", () => {
      expect(Measure.fromJS({
        name: "avg_price",
        title: "Average Price",
        expression: "$main.average($price)"
      } as any).toJS()).to.deep.equal({
        name: "avg_price",
        title: "Average Price",
        formula: "$main.average($price)"
      });
    });

  });

  describe(".measuresFromAttributeInfo", () => {
    it("works with sum", () => {
      const attribute = AttributeInfo.fromJS({
        name: "price",
        type: "NUMBER",
        unsplitable: true,
        maker: {
          action: "sum",
          expression: {
            name: "price",
            op: "ref"
          }
        }
      });
      const measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          name: "price",
          title: "Price",
          formula: "$main.sum($price)"
        }
      ]);
    });

    it("works with min", () => {
      const attribute = AttributeInfo.fromJS({
        name: "price",
        type: "NUMBER",
        unsplitable: true,
        maker: {
          action: "min",
          expression: {
            name: "price",
            op: "ref"
          }
        }
      });
      const measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          name: "price",
          title: "Price",
          formula: "$main.min($price)"
        }
      ]);
    });

    it("works with max", () => {
      const attribute = AttributeInfo.fromJS({
        name: "price",
        type: "NUMBER",
        unsplitable: true,
        maker: {
          action: "max",
          expression: {
            name: "price",
            op: "ref"
          }
        }
      });

      const measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          name: "price",
          title: "Price",
          formula: "$main.max($price)"
        }
      ]);
    });

    it("works with histogram", () => {
      const attribute = AttributeInfo.fromJS({
        name: "delta_hist",
        nativeType: "approximateHistogram",
        type: "NUMBER"
      });

      const measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          name: "delta_hist_p98",
          title: "Delta Hist P98",
          formula: "$main.quantile($delta_hist,0.98)"
        }
      ]);
    });

    it("works with unique", () => {
      const attribute = AttributeInfo.fromJS({
        name: "unique_page",
        nativeType: "hyperUnique",
        type: "STRING"
      });
      const measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          name: "unique_page",
          title: "Unique Page",
          formula: "$main.countDistinct($unique_page)"
        }
      ]);
    });

    it("works with theta", () => {
      const attribute = AttributeInfo.fromJS({
        name: "page_theta",
        nativeType: "thetaSketch",
        type: "STRING"
      });
      const measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          name: "page_theta",
          title: "Page Theta",
          formula: "$main.countDistinct($page_theta)"
        }
      ]);
    });

  });

});

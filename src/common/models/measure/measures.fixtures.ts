/*
 * Copyright 2017-2019 Allegro.pl
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

import { fromEntries } from "../../utils/object/object";
import { Measure } from "./measure";
import { MeasureFixtures } from "./measure.fixtures";
import { MeasureGroupJS, Measures } from "./measures";

export class MeasuresFixtures {
  static fromMeasures(measures: Measure[]): Measures {
    return {
      tree: measures.map(m => m.name),
      byName: fromEntries(measures.map(m => [m.name, m] as [string, Measure]))
    };
  }

  static noTitleJS(): MeasureGroupJS {
    return {
      name: "dummyName",
      measures: [
        MeasureFixtures.wikiCountJS()
      ]
    };
  }

  static withTitleInferredJS(): MeasureGroupJS {
    return {
      name: "dummyName",
      title: "Dummy Name",
      measures: [
        MeasureFixtures.wikiCountJS()
      ]
    };
  }

  static noNameJS(): MeasureGroupJS {
    return {
      measures: [MeasureFixtures.wikiCountJS()]
    } as MeasureGroupJS;
  }

  static emptyMeasuresJS(): MeasureGroupJS {
    return {
      name: "dummyName",
      measures: []
    } as MeasureGroupJS;
  }

  static wikiNames(): string[] {
    return ["count", "added", "avg_added", "delta", "avg_delta"];
  }

  static wiki(): Measures {
    return {
      tree: [
        "count",
        {
          name: "other",
          title: "Other",
          measures: [
            {

              name: "added_group",
              title: "Added Group",
              measures: ["added", "avg_added"]
            },
            {

              name: "delta_group",
              title: "Delta Group",
              measures: ["delta", "avg_delta"]
            }
          ]
        }
      ],
      byName: {
        count: MeasureFixtures.count(),
        added: MeasureFixtures.added(),
        avg_added: MeasureFixtures.avgAdded(),
        delta: MeasureFixtures.delta(),
        avg_delta: MeasureFixtures.avgDelta()
      }
    };
  }

  static twitter(): Measures {
    return MeasuresFixtures.fromMeasures([
      MeasureFixtures.count()
    ]);
  }
}

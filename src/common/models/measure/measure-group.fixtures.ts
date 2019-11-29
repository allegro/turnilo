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

import { MeasureGroupJS } from "./measure-group";
import { MeasureFixtures } from "./measure.fixtures";

export class MeasureGroupFixtures {
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

  static noMeasuresJS(): MeasureGroupJS {
    return {
      name: "dummyName"
    } as MeasureGroupJS;
  }

  static emptyMeasuresJS(): MeasureGroupJS {
    return {
      name: "dummyName",
      measures: []
    } as MeasureGroupJS;
  }

  static wikiAddedJS(): MeasureGroupJS {
    return {
      name: "added_group",
      title: "Added Group",
      measures: [
        {
          name: "added",
          title: "Added",
          formula: "$main.sum($added)"
        },
        {
          name: "avg_added",
          title: "Avg Added",
          formula: "$main.average($added)"
        }
      ]
    };
  }

  static wikiDeltaJS(): MeasureGroupJS {
    return {
      name: "delta_group",
      title: "Delta Group",
      measures: [
        {
          name: "delta",
          title: "Delta",
          formula: "$main.sum($delta)"
        },
        {
          name: "avg_delta",
          title: "Avg Delta",
          formula: "$main.average($delta)"
        }
      ]
    };
  }
}

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

import { $ } from "plywood";
import { Measure, MeasureJS } from "./measure";
import { createMeasure } from "./measures";

export class MeasureFixtures {
  static count(): Measure {
    return createMeasure("count", $("main").count());
  }

  static added(): Measure {
    return createMeasure("added", $("main").sum($("added")));
  }

  static avgAdded(): Measure {
    return createMeasure("avg_added", $("main").average($("added")));
  }

  static delta(): Measure {
    return createMeasure("delta", $("main").sum($("delta")));
  }

  static avgDelta(): Measure {
    return createMeasure("avg_delta", $("main").average($("delta")));
  }

  static histogram(): Measure {
    return createMeasure("histogram", $("main").quantile($("create_to_collect_duration_histogram"), 0.95, "k=128"));
  }

  static wikiCountJS(): MeasureJS {
    return {
      name: "count",
      title: "Count",
      formula: "$main.sum($count)"
    };
  }

  static previousWikiCountJS(): MeasureJS {
    return {
      name: "_previous__count",
      title: "Count",
      formula: "$main.sum($count)"
    };
  }

  static deltaWikiCountJS(): MeasureJS {
    return {
      name: "_delta__count",
      title: "Count",
      formula: "$main.sum($count)"
    };
  }

  static wikiUniqueUsers(): Measure {
    return createMeasure("unique_users", $("main").countDistinct($("unique_users")));
  }
}

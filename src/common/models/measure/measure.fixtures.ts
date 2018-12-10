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

import { plywoodExpressionKey } from "../data-series/data-series-names";
import { SeriesDerivation } from "../series/series-definition";
import { Measure, MeasureJS } from "./measure";

export class MeasureFixtures {
  static wikiCountJS(): MeasureJS {
    return {
      name: "count",
      title: "Count",
      formula: "$main.sum($count)"
    };
  }

  static previousWikiCountJS(): MeasureJS {
    return {
      name: plywoodExpressionKey("count", SeriesDerivation.PREVIOUS),
      title: "Count",
      formula: "$main.sum($count)"
    };
  }

  static deltaWikiCountJS(): MeasureJS {
    return {
      name: plywoodExpressionKey("count", SeriesDerivation.DELTA),
      title: "Count",
      formula: "$main.sum($count)"
    };
  }

  static wikiCount(): Measure {
    return new Measure(MeasureFixtures.wikiCountJS());
  }

  static wikiAdded(): Measure {
    return new Measure(MeasureFixtures.wikiAddedJS());
  }

  static wikiCountLowerIsBetter(): Measure {
    return new Measure({
      ...MeasureFixtures.wikiCountJS(),
      lowerIsBetter: true
    });
  }

  static wikiUniqueUsersJS(): MeasureJS {
    return {
      name: "unique_users",
      title: "Unique Users",
      formula: "$main.countDistinct($unique_users)"
    };
  }

  static wikiUniqueUsers(): Measure {
    return new Measure({
      name: "unique_users",
      title: "Unique Users",
      formula: "$main.countDistinct($unique_users)"
    });
  }

  static twitterCount(): Measure {
    return Measure.fromJS({
      name: "count",
      formula: "$main.count()"
    });
  }

  static itemsMeasure(): Measure {
    return Measure.fromJS({
      name: "items_measure",
      formula: "$main.sum($item)"
    });
  }

  static wikiAddedJS() {
    return {
      name: "added",
      title: "Added",
      formula: "$main.sum($added)"
    };
  }
}

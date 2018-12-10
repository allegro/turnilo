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

import { MeasureFixtures } from "../measure/measure.fixtures";
import { SeriesDefinition, SeriesPercentages } from "./series-definition";

export class SeriesFixtures {
  static wikiCount(): SeriesDefinition {
    const reference = MeasureFixtures.wikiCount().name;
    return new SeriesDefinition({ reference });
  }

  static wikiAdded(): SeriesDefinition {
    const reference = MeasureFixtures.wikiAdded().name;
    return new SeriesDefinition({ reference });
  }

  static wikiCountWithPercents(): SeriesDefinition {
    const reference = MeasureFixtures.wikiCount().name;
    const percentages = new SeriesPercentages({ ofParent: true, ofTotal: true });
    return new SeriesDefinition({ reference, percentages });
  }
}

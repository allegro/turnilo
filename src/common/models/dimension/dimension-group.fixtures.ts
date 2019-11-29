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

import { DimensionGroupJS } from "./dimension-group";
import { DimensionFixtures } from "./dimension.fixtures";

export class DimensionGroupFixtures {
  static noTitleJS(): DimensionGroupJS {
    return {
      name: "dummyName",
      dimensions: [
        DimensionFixtures.wikiTimeJS()
      ]
    };
  }

  static withTitleInferredJS(): DimensionGroupJS {
    return {
      name: "dummyName",
      title: "Dummy Name",
      dimensions: [
        DimensionFixtures.wikiTimeJS()
      ]
    };
  }

  static noNameJS(): DimensionGroupJS {
    return {
      dimensions: [DimensionFixtures.wikiTimeJS()]
    } as DimensionGroupJS;
  }

  static noDimensionsJS(): DimensionGroupJS {
    return {
      name: "dummyName"
    } as DimensionGroupJS;
  }

  static emptyDimensionsJS(): DimensionGroupJS {
    return {
      name: "dummyName",
      dimensions: []
    } as DimensionGroupJS;
  }

  static commentsJS(): DimensionGroupJS {
    return {
      name: "comment_group",
      title: "Comment Group",
      dimensions: [
        {
          kind: "string",
          name: "comment",
          title: "Comment",
          formula: "$comment"
        },
        {
          kind: "number",
          name: "commentLength",
          title: "Comment Length",
          formula: "$commentLength"
        },
        {
          kind: "boolean",
          name: "commentLengthOver100",
          title: "Comment Length Over 100",
          formula: "$commentLength > 100"
        }
      ]
    };
  }
}

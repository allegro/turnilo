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
import { Datum } from "plywood";
import { SPLIT } from "../../../config/constants";

export const dataset: Datum[] = [
  {
    channel: "en", [SPLIT]: {
      data: [
        { namespace: "a", count: 123 },
        { namespace: "b", count: 12 },
        { namespace: "c", count: 0 },
        { namespace: "d", count: 2 },
        { namespace: "e", count: 90 },
        { namespace: "f", count: 654 }
      ]
    }
  }, {
    channel: "de", [SPLIT]: {
      data: [
        { namespace: "a", count: 543 },
        { namespace: "b", count: 10000 },
        { namespace: "c", count: 0 },
        { namespace: "d", count: 0 },
        { namespace: "e", count: 0 },
        { namespace: "f", count: 1 }
      ]
    }
  }, {
    channel: "fr", [SPLIT]: {
      data: [
        { namespace: "a", count: 7 },
        { namespace: "b", count: 2 },
        { namespace: "c", count: 0 },
        { namespace: "d", count: 0 },
        { namespace: "e", count: 9 },
        { namespace: "f", count: 0 }
      ]
    }
  }, {
    channel: "pl", [SPLIT]: {
      data: [
        { namespace: "a", count: 0 },
        { namespace: "b", count: 42 },
        { namespace: "c", count: 76 },
        { namespace: "d", count: 23 },
        { namespace: "e", count: 98 },
        { namespace: "f", count: 0 }
      ]
    }
  }
] as any;

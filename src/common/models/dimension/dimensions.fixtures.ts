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

import { DimensionOrGroupJS } from "./dimension-group";
import { DimensionGroupFixtures } from "./dimension-group.fixtures";
import { DimensionFixtures } from "./dimension.fixtures";

export class DimensionsFixtures {
  static wikiNames(): string[] {
    return ["time", "country", "channel", "comment", "commentLength", "commentLengthOver100", "isRobot", "namespace", "articleName", "page", "page_last_author", "userChars"];
  }

  static wikiTitles(): string[] {
    return ["Time", "Country", "Channel", "Comment", "Comment Length", "Comment Length Over 100", "Is Robot", "Namespace", "Article Name", "Page", "Page Author", "User Chars"];
  }

  static wikiJS(): DimensionOrGroupJS[] {
    return [
      DimensionFixtures.wikiTimeJS(),
      {
        kind: "string",
        name: "country",
        title: "Country",
        formula: "$country"
      },
      {
        kind: "string",
        name: "channel",
        title: "Channel",
        formula: "$channel"
      },
      DimensionGroupFixtures.commentsJS(),
      {
        kind: "string",
        name: "isRobot",
        title: "Is Robot",
        formula: "$isRobot"
      },
      {
        kind: "string",
        name: "namespace",
        title: "Namespace",
        formula: "$namespace"
      },
      {
        kind: "string",
        name: "articleName",
        title: "Article Name",
        formula: "$articleName"
      },
      {
        kind: "string",
        name: "page",
        title: "Page",
        formula: "$page"
      },
      {
        kind: "string",
        name: "page_last_author",
        title: "Page Author",
        formula: "$page.lookup(page_last_author)"
      },
      {
        kind: "string",
        name: "userChars",
        title: "User Chars",
        formula: "$userChars"
      }
    ];
  }

  static twitterJS(): DimensionOrGroupJS[] {
    return [
      {
        kind: "time",
        name: "time",
        title: "Time",
        formula: "$time"
      },
      {
        kind: "string",
        name: "twitterHandle",
        title: "Twitter Handle",
        formula: "$twitterHandle"
      },
      {
        kind: "number",
        name: "tweetLength",
        title: "Tweet Length",
        formula: "$tweetLength"
      }
    ];
  }
}

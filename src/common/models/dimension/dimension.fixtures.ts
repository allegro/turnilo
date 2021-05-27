/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { $, Expression } from "plywood";
import { createDimension, Dimension } from "./dimension";

export class DimensionFixtures {
  static wikiTime(): Dimension {
    return createDimension("time", "time", $("time"));
  }

  static wikiIsRobot(): Dimension {
    return createDimension("boolean", "isRobot", $("isRobot"));
  }

  static wikiChannel(): Dimension {
    return createDimension("string", "channel", $("channel"));
  }

  static countryString() {
    return {
      ...createDimension("string", "country", $("country")),
      title: "important countries"
    };
  }

  static countryURL() {
    return {
      ...createDimension("string", "country", $("country")),
      title: "important countries",
      url: "https://www.country.com/%s" // country.com redirects to a CMT.com. Could've been worse.
    };
  }

  static time() {
    return {
      ...createDimension("time", "time", $("time")),
      url: "http://www.time.com/%s"
    };
  }

  static number() {
    return createDimension("number", "numeric", $("n"));
  }

  static tweetLength() {
    return createDimension("number", "tweetLength", $("tweetLength"));
  }

  static wikiCommentLength() {
    return createDimension("number", "commentLength", $("commentLength"));
  }

  static comment() {
    return createDimension("string", "comment", $("comment"));
  }

  static commentOver100() {
    return createDimension("boolean", "commentLengthOver100", Expression.parse("$commentLength > 100"));
  }

  static twitterHandle() {
    return createDimension("string", "twitterHandle", $("twitterHandle"));
  }

  static namespace() {
    return createDimension("string", "namespace", $("namespace"));
  }

  static articleName() {
    return createDimension("string", "articleName", $("articleName"));
  }

  static page() {
    return createDimension("string", "page", $("page"));
  }

  static userCharts() {
    return createDimension("string", "userCharts", $("userCharts"));
  }

  static pageLastAuthor() {
    return createDimension("string", "page_last_author", Expression.parse("$page.lookup(page_last_author)"));
  }
}

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

import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import { classNames } from "../../utils/dom/dom";
import { HighlightString } from "../highlight-string/highlight-string";

interface TextRowProps {
  value: string;
  onClick: Unary<string, void>;
  measure: string;
  searchText: string;
}

export const TextRow: React.SFC<TextRowProps> = props => {
  const { measure, value, searchText, onClick } = props;
  const clickable = !!onClick;
  return <div
    className={classNames("row", { selectable: clickable })}
    key={value}
    onClick={() => clickable && onClick(value)}>
    <div className="segment-value" title={value}>
      <HighlightString className="label" text={value} highlight={searchText} />
    </div>
    {measure && <div className="measure-value">{measure}</div>}
  </div>;
};

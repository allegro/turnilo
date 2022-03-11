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

import React from "react";
import { Binary } from "../../../common/utils/functional/functional";
import { classNames } from "../../utils/dom/dom";
import { Checkbox, CheckboxType } from "../checkbox/checkbox";
import { HighlightString } from "../highlight-string/highlight-string";
import "./string-value.scss";

interface StringValueProps {
  value: unknown;
  selected: boolean;
  checkboxStyle: string;
  highlight: string;
  onRowSelect: Binary<unknown, boolean, void>;
}

const hasModKey = (e: React.MouseEvent<unknown>) => e.altKey || e.ctrlKey || e.metaKey;

export const StringValue: React.FunctionComponent<StringValueProps> = props => {
  const { value, selected, checkboxStyle, highlight, onRowSelect } = props;
  const label = String(value);

  return <div
    className={classNames("string-value", { selected })}
    title={label}
    onClick={e => onRowSelect(value, hasModKey(e))}
  >
    <div className="value-wrapper">
      <Checkbox type={checkboxStyle as CheckboxType} selected={selected} />
      <HighlightString className="label" text={label} highlight={highlight} />
    </div>
  </div>;
};

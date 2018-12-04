/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./checkbox.scss";

export type CheckboxType = "check" | "cross" | "radio";

export interface CheckboxProps {
  selected: boolean;
  type?: CheckboxType;
  disabled?: boolean;
  color?: string;
}

function renderIcon(selected: boolean, type: CheckboxType) {
  if (!selected) return null;
  switch (type) {
    case "check":
      return <SvgIcon svg={require("../../icons/check.svg")} />;
    case "cross":
      return <SvgIcon svg={require("../../icons/x.svg")} />;
    default:
      return null;
  }
}

export const Checkbox: React.SFC<CheckboxProps> = ({ selected, type = "check", disabled, color }) => {
  const icon = renderIcon(selected, type);
  const style = color ? { background: color } : null;
  return <div className={classNames("checkbox", type, { disabled, selected })}>
    <div className="checkbox-body" style={style} />
    {icon}
  </div>;
};

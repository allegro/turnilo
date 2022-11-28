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

import React from "react";
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./checkbox.scss";

export type CheckboxType = "check" | "cross" | "radio";

export interface CheckboxProps {
  selected: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: CheckboxType;
  color?: string;
  label?: string;
  className?: string;
}

export interface CheckboxState {
}

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {

  static defaultProps: Partial<CheckboxProps> = {
    type: "check"
  };

  renderIcon() {
    const { selected, type } = this.props;
    if (!selected) return null;
    if (type === "check") {
      return <SvgIcon svg={require("../../icons/check.svg")} />;
    } else if (type === "cross") {
      return <SvgIcon svg={require("../../icons/x.svg")} />;
    }
    return null;
  }

  render() {
    const { onClick, type, color, selected, label, className } = this.props;

    let style: React.CSSProperties = null;
    if (color) {
      style = { background: color };
    }

    return <div className={classNames("checkbox", type, className, { selected, color })} onClick={onClick}>
      <div className="checkbox-body" style={style} />
      {this.renderIcon()}
      {label ? <div className="label">{label}</div> : null}
    </div>;
  }
}

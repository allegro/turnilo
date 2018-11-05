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
import { SvgIcon } from "../svg-icon/svg-icon";
import "./clearable-input.scss";

function focusOnInput(input: HTMLInputElement): any {
  if (!input) return;
  input.focus();
  const length = input.value.length;
  input.setSelectionRange(length, length);
}

export interface ClearableInputProps {
  className?: string;
  type?: string;
  placeholder?: string;
  focusOnMount?: boolean;
  value: string;
  onChange: (newValue: string) => any;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}

export interface ClearableInputState {
}

export class ClearableInput extends React.Component<ClearableInputProps, ClearableInputState> {
  static defaultProps = {
    type: "text",
    value: ""
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(e.target.value);
  }

  onClear = () => {
    this.props.onChange("");
  }

  render() {
    const { className, type, placeholder, focusOnMount, value, onBlur } = this.props;

    const ref = focusOnMount ? focusOnInput : null;

    const classNames = ["clearable-input"];
    if (className) classNames.push(className);
    if (!value) classNames.push("empty");

    return <div className={classNames.join(" ")}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={this.onChange}
        onBlur={onBlur}
        ref={ref}
      />
      <div className="clear" onClick={this.onClear}>
        <SvgIcon svg={require("../../icons/x.svg")} />
      </div>
    </div>;
  }
}

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
import { Unary } from "../../../common/utils/functional/functional";
import { classNames } from "../../utils/dom/dom";
import { ButtonGroup, GroupMember } from "../button-group/button-group";
import "./input-with-presets.scss";

export interface Preset<T> {
  name: string;
  identity: T;
}

export interface InputWithPresetsProps<T> {
  presets: Array<Preset<T>>;
  selected?: T;
  onChange: Unary<T, void>;
  errorMessage?: string;
  placeholder?: string;
  title?: string;
  parseCustomValue: Unary<string, T>;
  formatCustomValue: Unary<T, string>;
}

interface InputWithPresetsState {
  customPicked: boolean;
  customValue: string;
}

export class InputWithPresets<T> extends React.Component<InputWithPresetsProps<T>, InputWithPresetsState> {

  initialState(): InputWithPresetsState {
    const { selected, presets, formatCustomValue } = this.props;
    const isPresetPicked = presets.some(({ identity }) => identity === selected);
    const customPicked = selected !== undefined && !isPresetPicked;
    const customValue = customPicked ? formatCustomValue(selected) : "";
    return { customPicked, customValue };
  }

  state = this.initialState();

  customValueUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { onChange, parseCustomValue } = this.props;
    const customValue = e.currentTarget.value;
    onChange(parseCustomValue(customValue));
    this.setState({ customValue });
  };

  pickCustom = () => {
    const { onChange, parseCustomValue } = this.props;
    this.setState({ customPicked: true });
    onChange(parseCustomValue(this.state.customValue));
  };

  pickPreset = (value: T) => {
    const { onChange } = this.props;
    this.setState({ customPicked: false });
    onChange(value);
  };

  render() {
    const { errorMessage, selected, presets, placeholder, title, parseCustomValue } = this.props;
    const { customPicked, customValue } = this.state;

    const presetButtons = presets.map(({ name, identity }) => ({
      key: String(identity),
      title: name,
      isSelected: !customPicked && identity === selected,
      onClick: () => this.pickPreset(identity)
    }));

    const customSelected = customPicked && selected === parseCustomValue(customValue);

    const customButton: GroupMember = {
      key: "custom",
      title: "…",
      onClick: this.pickCustom,
      isSelected: customSelected
    };

    const members = [...presetButtons, customButton];

    const renderErrorMessage = customSelected && errorMessage && customValue.length > 0;

    return <React.Fragment>
      <ButtonGroup title={title} groupMembers={members} />
      {customSelected && <input type="text"
                                className={classNames("custom-input", { invalid: errorMessage })}
                                placeholder={placeholder}
                                value={customValue}
                                onChange={this.customValueUpdate} />}
      {renderErrorMessage && <span className="error-message">{errorMessage}</span>}
    </React.Fragment>;
  }
}

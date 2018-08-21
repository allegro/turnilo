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
import { ButtonGroup, GroupMember } from "../button-group/button-group";
import "./input-with-presets.scss";

export interface Preset {
  name: string;
  identity: string;
}

export interface InputWithPresetsProps {
  presets: Preset[];
  selected?: string;
  onChange: Unary<string, void>;
  errorMessage?: string;
  placeholder?: string;
  title?: string;
}

export const InputWithPresets: React.SFC<InputWithPresetsProps> = ({ errorMessage, onChange, presets, selected, placeholder, title }) => {

  function changeCustomValue(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.currentTarget.value);
  }

  const presetButtons = presets.map(({ name, identity }) => ({
    key: identity,
    title: name,
    isSelected: identity === selected,
    onClick: () => onChange(identity)
  }));

  const customSelected = selected !== undefined && !presets.some(({ identity }) => identity === selected);

  const customButton: GroupMember = {
    key: "custom",
    title: "...",
    onClick: () => onChange(""),
    isSelected: customSelected
  };

  const members = [...presetButtons, customButton];

  return <React.Fragment>
    <ButtonGroup title={title} groupMembers={members}/>
    {customSelected && <input type="text"
                              className={classNames("custom-input", { invalid: errorMessage })}
                              placeholder={placeholder}
                              value={selected}
                              onChange={changeCustomValue}/>}
    {selected !== "" && errorMessage && <span className="error-message">{errorMessage}</span>}
  </React.Fragment>;
};

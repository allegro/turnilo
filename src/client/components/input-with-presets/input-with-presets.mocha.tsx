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

import { expect } from "chai";
import { shallow } from "enzyme";
import React from "react";
import { identity, noop } from "../../../common/utils/functional/functional";
import { ButtonGroup, GroupMember } from "../button-group/button-group";
import { InputWithPresets, Preset } from "./input-with-presets";

const PRESETS: Array<Preset<string>> = [{
  name: "A", identity: "a"
}, {
  name: "B", identity: "b"
}];

function renderInputWithPresets(selected: string, errorMessage?: string) {
  return shallow(<InputWithPresets<string> presets={PRESETS} errorMessage={errorMessage} onChange={noop} selected={selected} formatCustomValue={identity} parseCustomValue={identity} />);
}

describe("<InputWithPresets>", () => {

  it("should select one of <ButtonGroup> members if one of presets selected", () => {
    const inputWithPresets = renderInputWithPresets("a");
    const buttonGroup = inputWithPresets.find(ButtonGroup);
    const groupMembers = buttonGroup.prop("groupMembers") as GroupMember[];
    const selectedMember = groupMembers.find(({ isSelected }) => isSelected);

    expect(selectedMember, "one member is selected").to.exist;
    expect(selectedMember.title, "member has correct title").to.equal("A");
    expect(selectedMember.key, "members key is equal to selected prop").to.equal("a");
  });

  it("should hide input if one of presets selected", () => {
    const inputWithPresets = renderInputWithPresets("a");
    const input = inputWithPresets.find("input");

    expect(input.length).to.equal(0);
  });

  it("should set input for custom value", () => {
    const inputWithPresets = renderInputWithPresets("c");
    const input = inputWithPresets.find("input");

    expect(input.length).to.equal(1);
    expect(input.prop("value")).to.equal("c");
  });

  it("should display error message for custom value", () => {
    const message = "invalid value";
    const inputWithPresets = renderInputWithPresets("c", message);

    expect(inputWithPresets.text()).to.contain(message);
  });
});

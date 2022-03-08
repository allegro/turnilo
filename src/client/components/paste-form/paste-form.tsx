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

import { Set } from "immutable";
import React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { Button } from "../button/button";
import "./paste-form.scss";

interface PasteFormProps {
  onSelect: Unary<Set<string>, void>;
  onClose: Fn;
}

interface PasteFormState {
  value: string;
}

function focus(textArea: HTMLTextAreaElement): void {
  if (!textArea) return;
  textArea.focus();
}

export class PasteForm extends React.Component<PasteFormProps, PasteFormState> {

  state: PasteFormState = { value: "" };

  values = (): Set<string> => {
    const { value } = this.state;
    return Set(value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0));
  };

  select = () => {
    const { onClose, onSelect } = this.props;
    const values = this.values();
    if (values.isEmpty()) return;
    onSelect(Set(values));
    onClose();
  };

  cancel = () => this.props.onClose();

  saveValue = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => this.setState({ value });

  render() {
    const { value } = this.state;
    const disabled = this.values().isEmpty();
    return <div>
      <textarea ref={focus} className="paste-field" value={value} onChange={this.saveValue} />
      <div className="paste-actions">
        <Button type="primary" title="Select" disabled={disabled} onClick={this.select} />
        <Button type="secondary" title="Cancel" onClick={this.cancel} />
      </div>
    </div>;
  }
}

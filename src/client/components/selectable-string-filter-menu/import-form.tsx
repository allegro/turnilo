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

import { Set } from "immutable";
import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { Button } from "../button/button";
import "./import-form.scss";

interface ImportFieldProps {
  initialValues: Set<string>;
  onSave: Unary<Set<string>, void>;
  onClose: Fn;
}

interface ImportFieldState {
  value: string;
}

export class ImportForm extends React.Component<ImportFieldProps, ImportFieldState> {

  state: ImportFieldState = { value: this.props.initialValues.join("\n") };

  import = () => {
    const { onClose, onSave } = this.props;
    const { value } = this.state;
    onSave(Set(value.split("\n")));
    onClose();
  }

  cancel = () => this.props.onClose();

  saveValue = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => this.setState({ value });

  render() {
    const { value } = this.state;
    const {} = this.props;
    return <div className="import-form">
      <textarea className="import-field" value={value} onChange={this.saveValue} />
      <div className="import-actions">
        <Button type="primary" title="Import!" onClick={this.import} />
        <Button type="secondary" title="Cancel" onClick={this.cancel} />
      </div>
    </div>;
  }
}

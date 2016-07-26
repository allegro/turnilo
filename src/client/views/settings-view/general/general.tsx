/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./general.css');

import { Timezone } from 'chronoshift';
import * as React from 'react';
import { Fn } from '../../../../common/utils/general/general';
import { classNames } from '../../../utils/dom/dom';

import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';
import { ImmutableInput } from '../../../components/immutable-input/immutable-input';

import { GENERAL as LABELS } from '../../../../common/models/labels';

import { AppSettings, AppSettingsJS } from '../../../../common/models/index';

export interface GeneralProps extends React.Props<any> {
  settings?: AppSettings;
  onSave?: (settings: AppSettings) => void;
}

export interface GeneralState {
  newSettings?: AppSettings;
  hasChanged?: boolean;
  errors?: any;
}

export class General extends React.Component<GeneralProps, GeneralState> {
  constructor() {
    super();

    this.state = {hasChanged: false, errors: {}};
  }

  componentWillReceiveProps(nextProps: GeneralProps) {
    if (nextProps.settings) this.setState({
      newSettings: nextProps.settings,
      hasChanged: false,
      errors: {}
    });
  }

  onChange(newSettings: AppSettings, isValid: boolean, path: string, error: string) {
    const { errors } = this.state;
    const settings: AppSettings = this.props.settings;

    errors[path] = isValid ? false : error;

    this.setState({
      newSettings,
      errors,
      hasChanged: !settings.equals(newSettings)
    });
  }

  save() {
    if (this.props.onSave) {
      this.props.onSave(this.state.newSettings);
    }
  }

  parseTimezones(str: string): Timezone[] {
    return str.split(/\s*,\s*/)
      .map(Timezone.fromJS);
  }

  render() {
    const { hasChanged, newSettings, errors } = this.state;

    if (!newSettings) return null;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors);
    var makeTextInput = ImmutableInput.simpleGenerator(newSettings, this.onChange.bind(this));

    return <div className="general">
      <div className="title-bar">
        <div className="title">General</div>
        {hasChanged ? <Button className="save" title="Save" type="primary" onClick={this.save.bind(this)}/> : null}
      </div>
      <div className="content">
        <form className="vertical">
          {makeLabel('customization.title')}
          {makeTextInput('customization.title', /^.+$/, true)}

          {makeLabel('customization.timezones')}
          <ImmutableInput
            instance={newSettings}
            path={'customization.timezones'}
            onChange={this.onChange.bind(this)}

            valueToString={(value: any) => value ? value.join(', ') : undefined}
            stringToValue={this.parseTimezones.bind(this)}
          />

        </form>
      </div>
    </div>;
  }
}

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

import { ImmutableFormDelegate, ImmutableFormState } from '../../../utils/immutable-form-delegate/immutable-form-delegate';

export interface GeneralProps extends React.Props<any> {
  settings?: AppSettings;
  onSave?: (settings: AppSettings) => void;
}

export class General extends React.Component<GeneralProps, ImmutableFormState<AppSettings>> {

  private delegate: ImmutableFormDelegate<AppSettings>;

  constructor() {
    super();

    this.delegate = new ImmutableFormDelegate<AppSettings>(this);
  }

  componentWillReceiveProps(nextProps: GeneralProps) {
    if (nextProps.settings) this.setState({
      newInstance: nextProps.settings,
      errors: {}
    });
  }

  save() {
    if (this.props.onSave) {
      this.props.onSave(this.state.newInstance);
    }
  }

  parseTimezones(str: string): Timezone[] {
    return str.split(/\s*,\s*/)
      .map(Timezone.fromJS);
  }

  render() {
    const { canSave, newInstance, errors } = this.state;

    if (!newInstance) return null;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors);
    var makeTextInput = ImmutableInput.simpleGenerator(newInstance, this.delegate.onChange);

    return <div className="general">
      <div className="title-bar">
        <div className="title">General</div>
        {canSave ? <Button className="save" title="Save" type="primary" onClick={this.save.bind(this)}/> : null}
      </div>
      <div className="content">
        <form className="vertical">
          {makeLabel('customization.title')}
          {makeTextInput('customization.title', /^.+$/, true)}

          {makeLabel('customization.timezones')}
          <ImmutableInput
            instance={newInstance}
            path={'customization.timezones'}
            onChange={this.delegate.onChange}

            valueToString={(value: any) => value ? value.join(', ') : undefined}
            stringToValue={this.parseTimezones.bind(this)}
          />

        </form>
      </div>
    </div>;
  }
}

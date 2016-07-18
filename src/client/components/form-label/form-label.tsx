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

require('./form-label.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataCube, Filter, Dimension, Measure } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';
import { classNames } from '../../utils/dom/dom';

export interface FormLabelProps extends React.Props<any> {
  label?: string;
  helpText?: string;
  errorText?: string;
}

export interface FormLabelState {
  helpVisible: boolean;
}

export class FormLabel extends React.Component<FormLabelProps, FormLabelState> {
  constructor() {
    super();

    this.state = {helpVisible: false};
  }

  onHelpClick() {
    this.setState({helpVisible: !this.state.helpVisible});
  }

  renderIcon(): JSX.Element {
    const { helpText, errorText } = this.props;

    if (!helpText && !errorText) return null;

    const { helpVisible } = this.state;

    if (errorText) {
      return <div className="icon-container" onClick={this.onHelpClick.bind(this)}>
        <SvgIcon className="icon" svg={require(`../../icons/help-brand.svg`)}/>
        <SvgIcon className="icon hover" svg={require(`../../icons/help-brand.svg`)}/>
      </div>;
    }

    if (helpVisible) {
      return <div className="icon-container" onClick={this.onHelpClick.bind(this)}>
        <SvgIcon className="icon" svg={require(`../../icons/help-brand.svg`)}/>
        <SvgIcon className="icon hover" svg={require(`../../icons/help-brand.svg`)}/>
      </div>;
    }

    return <div className="icon-container" onClick={this.onHelpClick.bind(this)}>
      <SvgIcon className="icon" svg={require(`../../icons/help-brand-light.svg`)}/>
      <SvgIcon className="icon hover" svg={require(`../../icons/help-brand.svg`)}/>
    </div>;
  }

  renderAdditionalText(): JSX.Element {
    const { helpText, errorText } = this.props;
    const { helpVisible } = this.state;

    if (!helpVisible && !errorText) return null;

    return <div className="additional-text">
      {errorText ? <div className="error-text">{errorText}</div> : null}
      {helpVisible ? <div className="help-text">{helpText}</div> : null}
    </div>;
  }

  render() {
    const { label, errorText } = this.props;

    return <div className={classNames('form-label', {error: !!errorText})}>
      <div className="label">{label}</div>
      {this.renderIcon()}
      {this.renderAdditionalText()}
    </div>;
  }
}

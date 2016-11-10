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
import { firstUp } from '../../../common/utils/string/string';

export interface FormLabelProps extends React.Props<any> {
  label?: string;
  helpText?: string;
  errorText?: string;
  isBubble?: boolean;
}

export interface FormLabelState {
  helpVisible?: boolean;
  hideHelpIfNoError?: boolean;
}

export class FormLabel extends React.Component<FormLabelProps, FormLabelState> {
  static dumbLabel(label: string) {
    return <div className="form-label">
      <div className="label">{label}</div>
    </div>;
  }

  static simpleGenerator(labels: any, errors: any, isBubble = false) {
    return (name: string) => {
      let myLabels = labels[name] || {label: '', description: ''};

      return <FormLabel
        isBubble={isBubble}
        label={myLabels.label}
        helpText={myLabels.description}
        errorText={errors[name]}
      />;
    };
  }

  constructor() {
    super();

    this.state = {helpVisible: false};
  }

  componentWillReceiveProps(nextProps: FormLabelProps) {
    if (nextProps.errorText) {
      if (!this.state.helpVisible) this.setState({helpVisible: true, hideHelpIfNoError: true});
    } else if (this.state.hideHelpIfNoError) {
      this.setState({helpVisible: false, hideHelpIfNoError: false});
    } else {
      this.setState({hideHelpIfNoError: false});
    }
  }

  onHelpClick() {
    this.setState({helpVisible: !this.state.helpVisible, hideHelpIfNoError: false});
  }

  renderIcon(): JSX.Element {
    const { helpText, errorText } = this.props;

    if (!helpText && !errorText) return null;

    const { helpVisible } = this.state;

    if (errorText) {
      return <div className="icon-container error" onClick={this.onHelpClick.bind(this)}>
        <SvgIcon className="icon" svg={require(`../../icons/help.svg`)}/>
      </div>;
    }

    if (helpVisible) {
      return <div className="icon-container visible" onClick={this.onHelpClick.bind(this)}>
        <SvgIcon className="icon" svg={require(`../../icons/help.svg`)}/>
      </div>;
    }

    return <div className="icon-container" onClick={this.onHelpClick.bind(this)}>
      <SvgIcon className="icon" svg={require(`../../icons/help.svg`)}/>
    </div>;
  }

  renderAdditionalText(): JSX.Element {
    const { helpText, errorText } = this.props;
    const { helpVisible } = this.state;

    if (!helpVisible && !errorText) return null;

    return <div className="additional-text">
      {errorText ? <div className="error-text">{firstUp(errorText)}</div> : null}
      {helpVisible ? <div className="help-text" dangerouslySetInnerHTML={{__html: helpText}}></div> : null}
    </div>;
  }

  render() {
    const { label, errorText, isBubble } = this.props;

    return <div className={classNames('form-label', {error: !!errorText, bubble: isBubble})}>
      <div className="label">{label}</div>
      {this.renderIcon()}
      {this.renderAdditionalText()}
    </div>;
  }
}

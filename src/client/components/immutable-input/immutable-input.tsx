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

require('./immutable-input.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ImmutableUtils } from '../../../common/utils/index';
import { classNames } from '../../utils/dom/dom';

import { firstUp } from '../../../common/utils/string/string';

export interface ImmutableInputProps extends React.Props<any> {
  instance: any;
  path: string;
  focusOnStartUp?: boolean;
  onChange?: (newInstance: any, valid: boolean, path?: string) => void;
  onInvalid?: (invalidValue: string) => void;
  validator?: RegExp;
}

export interface ImmutableInputState {
  newInstance?: any;
  invalidValue?: string;
}

export class ImmutableInput extends React.Component<ImmutableInputProps, ImmutableInputState> {
  private focusAlreadyGiven =  false;

  constructor() {
    super();
    this.state = {};
  }

  initFromProps(props: ImmutableInputProps) {
    if (!props.instance || !props.path) return;

    this.setState({
      newInstance: props.instance,
      invalidValue: undefined
    });
  }

  componentWillReceiveProps(nextProps: ImmutableInputProps) {
    if (nextProps.instance !== this.state.newInstance) {
      this.initFromProps(nextProps);
    }
  }

  componentDidUpdate() {
    this.maybeFocus();
  }

  componentDidMount() {
    this.initFromProps(this.props);

    this.maybeFocus();
  }

  maybeFocus() {
    if (!this.focusAlreadyGiven && this.props.focusOnStartUp && this.refs['me']) {
      (ReactDOM.findDOMNode(this.refs['me']) as any).focus();
      this.focusAlreadyGiven = true;
    }
  }

  onChange(event: KeyboardEvent) {
    const { path, onChange, instance, validator, onInvalid } = this.props;

    var newValue: any = (event.target as HTMLInputElement).value;

    var newInstance: any;
    var invalidValue: string;

    if (validator && !validator.test(newValue)) {
      newInstance = instance;
      invalidValue = newValue;
      if (onInvalid) onInvalid(newValue);

    } else {
      try {
        newInstance = ImmutableUtils.setProperty(instance, path, newValue);
      } catch (e) {
        newInstance = instance;
        invalidValue = newValue;
        if (onInvalid) onInvalid(newValue);
      }
    }

    this.setState({newInstance, invalidValue});

    if (onChange) onChange(newInstance, invalidValue === undefined, path);
  }

  render() {
    const { path } = this.props;
    const { newInstance, invalidValue } = this.state;

    if (!path || !newInstance) return null;

    const value = ImmutableUtils.getProperty(newInstance, path);

    return <input
      className={classNames('immutable-input', {error: invalidValue !== undefined})}
      ref='me'
      type="text"
      value={(invalidValue !== undefined ? invalidValue : value) || ''}
      onChange={this.onChange.bind(this)}
    />;
  }
}

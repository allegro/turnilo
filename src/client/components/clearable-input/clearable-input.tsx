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

require('./clearable-input.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';

function focusOnInput(component: React.DOMComponent<React.HTMLAttributes>): void {
  if (!component) return;
  (component as any).focus();
}

export interface ClearableInputProps extends React.Props<any> {
  className?: string;
  type?: string;
  placeholder?: string;
  focusOnMount?: boolean;
  value: string;
  onChange: (newValue: string) => any;
  onBlur?: React.FocusEventHandler;
}

export interface ClearableInputState {
}

export class ClearableInput extends React.Component<ClearableInputProps, ClearableInputState> {

  constructor() {
    super();
  }

  onChange(e: KeyboardEvent) {
    this.props.onChange((e.target as HTMLInputElement).value);
  }

  onClear() {
    this.props.onChange('');
  }

  render() {
    const { className, type, placeholder, focusOnMount, value, onBlur } = this.props;

    var ref = focusOnMount ? focusOnInput : null;

    var classNames = ['clearable-input'];
    if (className) classNames.push(className);
    if (!value) classNames.push('empty');

    return <div className={classNames.join(' ')}>
      <input
        type={type || 'text'}
        placeholder={placeholder}
        value={value || ''}
        onChange={this.onChange.bind(this)}
        onBlur={onBlur}
        ref={ref}
      />
      <div className="clear" onClick={this.onClear.bind(this)}>
        <SvgIcon svg={require('../../icons/x.svg')}/>
      </div>
    </div>;
  }
}

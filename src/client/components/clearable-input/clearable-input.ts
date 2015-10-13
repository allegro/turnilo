'use strict';
require('./clearable-input.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';

function focusOnInput(input: HTMLInputElement): void {
  if (!input) return;
  input.focus();
}

export interface ClearableInputProps {
  className?: string;
  type?: string;
  placeholder?: string;
  focusOnMount?: boolean;
  value: string;
  onChange: Function;
}

export interface ClearableInputState {
}

export class ClearableInput extends React.Component<ClearableInputProps, ClearableInputState> {

  constructor() {
    super();
    // this.state = {};

  }

  onChange(e: KeyboardEvent) {
    this.props.onChange((<HTMLInputElement>e.target).value);
  }

  onClear() {
    this.props.onChange('');
  }

  render() {
    const { className, type, placeholder, focusOnMount, value } = this.props;

    var ref = focusOnMount ? focusOnInput : null;

    var classNames = ['clearable-input'];
    if (className) classNames.push(className);
    if (!value) classNames.push('empty');

    return JSX(`
      <div className={classNames.join(' ')}>
        <input
          type={type || 'text'}
          placeholder={placeholder}
          value={value || ''}
          onChange={this.onChange.bind(this)}
          ref={ref}
        />
        <div className="clear" onClick={this.onClear.bind(this)}>
          <SvgIcon svg={require('../../icons/x.svg')}/>
        </div>
      </div>
    `);
  }
}

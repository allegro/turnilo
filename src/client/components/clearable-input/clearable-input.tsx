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

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

require('./checkbox.css');

import * as React from 'react';
import { SvgIcon } from '../svg-icon/svg-icon';
import { classNames } from '../../utils/dom/dom';

export type CheckboxType = 'check' | 'cross' | 'radio';

export interface CheckboxProps extends React.Props<any> {
  selected: boolean;
  onClick?: React.MouseEventHandler;
  type?: CheckboxType;
  color?: string;
}

export interface CheckboxState {
}

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {

  static defaultProps = {
    type: 'check'
  };

  constructor() {
    super();

  }

  renderIcon() {
    const { selected, type } = this.props;
    if (!selected) return null;
    if (type === 'check') {
      return <SvgIcon svg={require('../../icons/check.svg')}/>;
    } else if (type === 'cross') {
      return <SvgIcon svg={require('../../icons/x.svg')}/>;
    }
    return null;
  }

  render() {
    const { onClick, type, color, selected } = this.props;

    var style: React.CSSProperties = null;
    if (color) {
      style = { background: color };
    }

    return <div className={classNames('checkbox', type, { selected, color })} onClick={onClick}>
      <div className="checkbox-body" style={style}></div>
      {this.renderIcon()}
    </div>;
  }
}

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

require('./button.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { classNames } from '../../utils/dom/dom';
import { SvgIcon } from '../svg-icon/svg-icon';

export type ButtonType = "primary" | "secondary" | "warn";

export interface ButtonProps extends React.Props<any> {
  type: ButtonType;
  className?: string;
  title?: string;
  svg?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: Fn;
}

export interface ButtonState {
}

export class Button extends React.Component<ButtonProps, ButtonState> {
  constructor() {
    super();
  }

  render() {
    const { title, type, className, svg, active, disabled, onClick } = this.props;

    var icon: JSX.Element = null;
    if (svg) {
      icon = <SvgIcon svg={svg}/>;
    }

    return <button
      className={classNames('button', type, className, { icon, active })}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {title}
    </button>;
  }
}

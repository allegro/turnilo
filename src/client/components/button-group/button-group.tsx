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

require('./button-group.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { classNames } from '../../utils/dom/dom';

export interface GroupMember {
  title: string;
  onClick: Fn;
  key: string | number;
  className?: string;
  isSelected?: boolean;
}

export interface ButtonGroupProps extends React.Props<any> {
  groupMembers: GroupMember[];
  title?: string;
  className?: string;
}

export interface ButtonGroupState {
}

export class ButtonGroup extends React.Component<ButtonGroupProps, ButtonGroupState> {

  constructor() {
    super();
  }

  renderMembers() {
    const { groupMembers } = this.props;
    return groupMembers.map((button) => {
      return <li className={classNames('group-member', button.className, {'selected' : button.isSelected})}
        key={button.key}
        onClick={button.onClick}
      >
        {button.title}
      </li>;
    });
  }

  render() {
    const { title, className } = this.props;

    return <div className={classNames('button-group', className)}>
      {title ? <div className="button-group-title">{title}</div> : null}
      <ul className="group-container">{this.renderMembers()}</ul>
    </div>;
  }
}

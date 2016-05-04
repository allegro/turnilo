require('./button-group.css');

import * as React from 'react';
import { Fn } from "../../../common/utils/general/general";
import { classNames } from "../../utils/dom/dom";

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

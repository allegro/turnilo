require('./button.css');

import * as React from 'react';
import { Fn } from "../../../common/utils/general/general";
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from '../svg-icon/svg-icon';

export type ButtonType = "primary" | "secondary";

export interface ButtonProps extends React.Props<any> {
  type: ButtonType;
  className?: string;
  title?: string;
  svg?: string;
  onClick?: Fn;
}

export interface ButtonState {
}

export class Button extends React.Component<ButtonProps, ButtonState> {
  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { title, type, className, svg, onClick } = this.props;

    var icon: JSX.Element = null;
    if (svg) {
      icon = <SvgIcon svg={svg}/>;
    }

    return <button
      className={classNames('button', type, className, { icon })}
      onClick={onClick}
    >
      {icon}
      {title}
    </button>;
  }
}

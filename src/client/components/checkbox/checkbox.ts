'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

const CHECKBOX_SIZE = 14;

interface CheckboxProps {
  checked: Boolean;
  onClick?: Function;
}

interface CheckboxState {
}

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { checked, onClick } = this.props;

    var check: React.ReactElement<any> = null;
    if (checked) {
      check = React.createElement(Icon, {
        name: "check",
        height: CHECKBOX_SIZE
      });
    }

    return JSX(`
      <div className={'checkbox' + (checked ? ' checked' : '')} onClick={onClick}>{check}</div>
    `);
  }
}

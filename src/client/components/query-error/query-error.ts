'use strict';
require('./query-error.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';

export interface QueryErrorProps {
  error: any;
}

export interface QueryErrorState {
}

export class QueryError extends React.Component<QueryErrorProps, QueryErrorState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { error } = this.props;

    return JSX(`
      <div className="query-error">
        <div className="whiteout"></div>
        <div className="container">
          <div className="error">Query Error</div>
          <div className="message">{error.message}</div>
        </div>
      </div>
    `);
  }
}

'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../models/index';

interface QueryErrorProps {
  error: any;
}

interface QueryErrorState {
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

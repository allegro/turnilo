require('./no-data-sources-application.css');

import * as React from 'react';
import { STRINGS } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface NoDataSourcesApplicationProps extends React.Props<any> {
}

export interface NoDataSourcesApplicationState {
}

export class NoDataSourcesApplication extends React.Component<NoDataSourcesApplicationProps, NoDataSourcesApplicationState> {
  private refreshTimer: any;

  constructor() {
    super();

  }

  componentDidMount() {
    this.refreshTimer = setInterval(() => {
      window.location.reload(true);
    }, 10000);
  }

  componentWillUnmount() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  render() {
    return <div className="no-data-sources-application">
      <div className="icon">
        <SvgIcon svg={require('../../icons/datasources.svg')}/>
      </div>
      <p>{STRINGS.noQueryableDataSources}</p>
    </div>;
  }
}

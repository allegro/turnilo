require('./vis-measure-label.css');

import * as React from 'react';
import { Datum } from 'plywood';
import { Measure } from '../../../common/models/index';

export interface VisMeasureLabelProps extends React.Props<any> {
  measure: Measure;
  datum: Datum;
}

export interface VisMeasureLabelState {
}

export class VisMeasureLabel extends React.Component<VisMeasureLabelProps, VisMeasureLabelState> {
  constructor() {
    super();

  }

  render() {
    const { measure, datum } = this.props;

    return <div className="vis-measure-label">
      <span className="measure-title">{measure.title}</span>
      <span className="colon">: </span>
      <span className="measure-value">{measure.formatFn(datum[measure.name] as number)}</span>
    </div>;
  }
}

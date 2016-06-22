require('./simple-list.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface SimpleRow {
  title: string;
  description?: string;
  icon?: string;
}

export interface SimpleListProps extends React.Props<any> {
  rows: SimpleRow[];
  onEdit?: (index: number) => void;
  onRemove?: (index: number) => void;
}

export interface SimpleListState {
}

export class SimpleList extends React.Component<SimpleListProps, SimpleListState> {
  constructor() {
    super();
  }

  renderRows(rows: SimpleRow[]): JSX.Element[] {
    if (!rows || !rows.length) return [];

    const { onEdit, onRemove } = this.props;
    const svgize = (iconName: string) => iconName ? <SvgIcon svg={require(`../../icons/${iconName}.svg`)}/> : null;

    return rows.map(({title, description, icon}, i) => {
      let svg = svgize(icon);
      let text = <div className="text">
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </div>;

      let actions = <div className="actions">
        <button onClick={onEdit.bind(this, i)}>{svgize('full-edit')}</button>
        <button onClick={onRemove.bind(this, i)}>{svgize('full-remove')}</button>
      </div>;

      return <div className="row" key={`row-${i}`}>
        {svg}
        {text}
        {actions}
      </div>;
    });
  }

  render() {
    const rows = this.renderRows(this.props.rows);

    return <div className="simple-list">
      {rows}
    </div>;
  }
}

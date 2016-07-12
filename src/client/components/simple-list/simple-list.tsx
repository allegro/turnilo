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

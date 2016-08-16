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

import { setDragGhost, classNames, getYFromEvent } from '../../utils/dom/dom';
import { Stage, Clicker, Essence, DataCube, Filter, Dimension, Measure } from '../../../common/models/index';
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
  onReorder?: (oldIndex: number, newIndex: number) => void;
}

export interface SimpleListState {
  draggedItem?: SimpleRow;
  dropIndex?: number;
}

export class SimpleList extends React.Component<SimpleListProps, SimpleListState> {
  constructor() {
    super();

    this.state = {dropIndex: -1};
  }

  dragStart(item: SimpleRow, e: DragEvent) {
    this.setState({draggedItem: item});

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'move';
    dataTransfer.setData("text/html", item.title);

    setDragGhost(dataTransfer, item.title);
  }

  isInTopHalf(e: DragEvent): boolean {
    var targetRect = (e.currentTarget as any).getBoundingClientRect();
    return getYFromEvent(e) - targetRect.top <= targetRect.height / 2;
  }

  dragOver(item: SimpleRow, e: DragEvent) {
    e.preventDefault();

    const { draggedItem, dropIndex } = this.state;
    const { rows } = this.props;

    if (dropIndex === -1 && item === draggedItem) return;

    var sourceIndex = rows.indexOf(draggedItem);
    var targetIndex = rows.indexOf(item);
    var newDropIndex = this.isInTopHalf(e) ? targetIndex : targetIndex + 1;

    if (newDropIndex === sourceIndex || newDropIndex === sourceIndex + 1) {
      this.setState({
        dropIndex: -1
      });
    } else if (newDropIndex !== dropIndex) {
      this.setState({
        dropIndex: newDropIndex
      });
    }
  }

  dragEnd(e: DragEvent) {
    const { rows, onReorder } = this.props;
    const { draggedItem, dropIndex } = this.state;

    if (dropIndex > -1) onReorder(rows.indexOf(draggedItem), dropIndex);

    this.setState({
      draggedItem: undefined,
      dropIndex: -1
    });
  }

  renderRows(rows: SimpleRow[]): JSX.Element[] {
    if (!rows || !rows.length) return [];

    const { onEdit, onRemove, onReorder } = this.props;
    const { draggedItem, dropIndex } = this.state;

    const svgize = (iconName: string) => iconName ? <SvgIcon svg={require(`../../icons/${iconName}.svg`)}/> : null;

    return rows.map((row, i) => {
      let {title, description, icon} = row;

      let dragHandle = <div className="drag-handle">
        <SvgIcon svg={require('../../icons/dragger.svg')}/>
      </div>;

      let svg = svgize(icon);
      let text = <div className="text">
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </div>;

      let actions = <div className="actions">
        <button onClick={onEdit.bind(this, i)}>{svgize('full-edit')}</button>
        <button onClick={onRemove.bind(this, i)}>{svgize('full-remove')}</button>
      </div>;

      const isBeingDragged = draggedItem === row;

      const classes = classNames(
        'row',
        {
          'drop-before': dropIndex === i,

          // last item takes care of both before and after indications
          'drop-after': i === rows.length - 1 && dropIndex === i + 1,

          'dragged': isBeingDragged
        }
      );

      return <div
        className={classes}
        key={`row-${i}`}
        onDragOver={this.dragOver.bind(this, row)}
        draggable={!!onReorder}
        onDragStart={this.dragStart.bind(this, row)}
      >
        {onReorder ? dragHandle : null}
        {svg}
        {text}
        {actions}
      </div>;
    });
  }

  render() {
    return <div
      className="simple-list"
      ref="list"
      onDragEnd={this.dragEnd.bind(this)}
    >
      {this.renderRows(this.props.rows)}
    </div>;
  }
}

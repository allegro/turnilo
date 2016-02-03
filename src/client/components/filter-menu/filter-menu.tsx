'use strict';
require('./filter-menu.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { BubbleMenu } from '../bubble-menu/bubble-menu';


import { StringFilterMenu } from '../string-filter-menu/string-filter-menu';
import { TimeFilterMenu } from '../time-filter-menu/time-filter-menu';


export interface FilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  direction: string;
  containerStage?: Stage;
  openOn: Element;
  dimension: Dimension;
  insertPosition: number;
  replacePosition: number;
  onClose: Function;
  inside?: Element;
}

export interface FilterMenuState {
}

export class FilterMenu extends React.Component<FilterMenuProps, FilterMenuState> {

  constructor() {
    super();
    // this.state = {};
  }

  render() {
    var { clicker, essence, insertPosition, replacePosition, direction, containerStage, openOn, dimension, onClose, inside } = this.props;
    if (!dimension) return null;

    var menuSize: Stage = null;
    var menuCont: JSX.Element = null;
    if (dimension.kind === 'time') {
      menuSize = Stage.fromSize(250, 274);
      menuCont = <TimeFilterMenu
        clicker={clicker}
        dimension={dimension}
        essence={essence}
        onClose={onClose}
      />;
    } else {
      menuSize = Stage.fromSize(250, 410);
      menuCont = <StringFilterMenu
        clicker={clicker}
        dimension={dimension}
        essence={essence}
        insertPosition={insertPosition}
        replacePosition={replacePosition}
        onClose={onClose}
      />;
    }

    return <BubbleMenu
      className="filter-menu"
      direction={direction}
      containerStage={containerStage}
      stage={menuSize}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      {menuCont}
    </BubbleMenu>;
  }
}

require('./filter-menu.css');

import * as React from 'react';
import { Fn } from "../../../common/utils/general/general";
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, DragPosition } from '../../../common/models/index';
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
  changePosition: DragPosition;
  onClose: Fn;
  inside?: Element;
}

export interface FilterMenuState {
}

export class FilterMenu extends React.Component<FilterMenuProps, FilterMenuState> {

  constructor() {
    super();
  }

  render() {
    var { clicker, essence, changePosition, direction, containerStage, openOn, dimension, onClose, inside } = this.props;
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
        changePosition={changePosition}
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

require('./pinboard-measure-tile.css');

import * as React from 'react';
import { Stage, Essence, DataSource, Filter, Dimension, Measure, SortOn } from '../../../common/models/index';
import { Dropdown } from '../dropdown/dropdown';

export interface PinboardMeasureTileProps extends React.Props<any> {
  essence: Essence;
  title: string;
  dimension?: Dimension;
  sortOn: SortOn;
  onSelect: (sel: SortOn) => void;
}

export interface PinboardMeasureTileState {
}

export class PinboardMeasureTile extends React.Component<PinboardMeasureTileProps, PinboardMeasureTileState> {
  constructor() {
    super();
  }

  render() {
    var { essence, title, dimension, sortOn, onSelect } = this.props;

    var sortOns = (dimension ? [SortOn.fromDimension(dimension)] : []).concat(
      essence.dataSource.measures.toArray().map(SortOn.fromMeasure)
    );

    const SortOnDropdown = Dropdown.specialize<SortOn>();

    return <div className="pinboard-measure-tile">
      <div className="title">{title}</div>
      <SortOnDropdown
        items={sortOns}
        selectedItem={sortOn}
        equal={SortOn.equal}
        renderItem={SortOn.getTitle}
        keyItem={SortOn.getName}
        onSelect={onSelect}
      />
    </div>;
  }
}

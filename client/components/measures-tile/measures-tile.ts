'use strict';

import { List, OrderedSet } from 'immutable';
import * as React from 'react/addons';
import * as numeral from 'numeral';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { PIN_TITLE_HEIGHT, SEARCH_BOX_HEIGHT, PIN_ITEM_HEIGHT, PIN_PADDING_BOTTOM } from '../../config/constants';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';
import { Checkbox } from '../checkbox/checkbox';

var objectHasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj: any, key: string): boolean {
  return objectHasOwnProperty.call(obj, key);
}

interface MeasuresTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  selectedMeasures: OrderedSet<string>;
}

interface MeasuresTileState {
  dataset?: Dataset;
  showSearch?: boolean;
}

export class MeasuresTile extends React.Component<MeasuresTileProps, MeasuresTileState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      dataset: null,
      showSearch: false
    };
  }

  fetchData(filter: Filter) {
    var { dataSource } = this.props;
    var measures = dataSource.measures;
    var $main = $('main');

    var query: any = $()
      .apply('main', $main.filter(filter.toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

    dataSource.dispatcher(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    this.mounted = true;
    var { filter } = this.props;
    this.fetchData(filter);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: MeasuresTileProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter) {
      this.fetchData(nextProps.filter);
    }
  }

  toggleSearch() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  render() {
    var { clicker, dataSource, selectedMeasures } = this.props;
    var { dataset, showSearch } = this.state;

    var myDatum = dataset ? dataset.data[0] : null;

    var maxHeight = PIN_TITLE_HEIGHT;

    var rows = dataSource.measures.map(measure => {
      var measureName = measure.name;
      var selected = selectedMeasures.has(measureName);

      var measureValueStr = '-';
      if (myDatum && hasOwnProperty(myDatum, measureName)) {
        measureValueStr = numeral(myDatum[measureName]).format(measure.format);
      }

      return JSX(`
        <div className={'row' + (selected ? ' selected' : '')} key={measureName}>
          <div className="measure-name" onClick={clicker.toggleMeasure.bind(clicker, measure)}>
            <Checkbox checked={selected}/>
            <div className="label">{measure.title}</div>
          </div>
          <div className="measure-value">{measureValueStr}</div>
        </div>
      `);
    });
    maxHeight += rows.size * PIN_ITEM_HEIGHT + PIN_PADDING_BOTTOM;

    const style = {
      maxHeight
    };

    return JSX(`
      <div className="measures-tile" style={style}>
        <TileHeader
          title="Measures"
          onSearch={this.toggleSearch.bind(this)}
          onClose={clicker.unpin.bind(clicker, 'measures')}
        />
        <div className="rows">{rows}</div>
      </div>
    `);
  }
}

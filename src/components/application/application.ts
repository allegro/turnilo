'use strict';

import React = require('react/addons');
import { List, OrderedSet } from 'immutable';
import { $, Expression, Datum, Dataset, NativeDataset, TimeRange, Dispatcher, find } from 'plywood';
import { dataTransferTypesContain } from '../../utils/dom';
import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource } from "../../models/index";

import { HeaderBar } from '../header-bar/header-bar';
import { TimeSeriesVis } from '../time-series-vis/time-series-vis';
import { NestedTableVis } from '../nested-table-vis/nested-table-vis';
import { FilterSplitPanel } from '../filter-split-panel/filter-split-panel';
import { VisBar } from '../vis-bar/vis-bar';
import { DropIndicator } from '../drop-indicator/drop-indicator';
import { SideDrawer } from '../side-drawer/side-drawer';
import { PinboardPanel } from '../pinboard-panel/pinboard-panel';

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

interface ApplicationProps {
  dataSources: List<DataSource>;
}

interface ApplicationState {
  dataSources?: List<DataSource>;
  dataSource?: DataSource;
  filter?: Filter;
  splits?: List<SplitCombine>;
  selectedMeasures?: OrderedSet<string>;
  pinnedDimensions?: OrderedSet<string>;
  dragOver?: boolean;
  drawerOpen?: boolean;
}

export class Application extends React.Component<ApplicationProps, ApplicationState> {
  private clicker: Clicker;
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      filter: new Filter(List([
        $('time').in(TimeRange.fromJS({
          start: new Date('2013-02-26T00:00:00Z'),
          end: new Date('2013-02-27T00:00:00Z')
        }))
      ])),
      splits: List([
        new SplitCombine($('page'), null, null)
      ])
    };

    var self = this;
    this.clicker = {
      changeDataSource: (dataSource: DataSource) => {
        var { dataSources } = self.state;
        var dataSourceName = dataSource.name;
        var existingDataSource = dataSources.find((ds) => ds.name === dataSourceName);
        if (!existingDataSource) throw new Error(`unknown DataSource changed: ${dataSourceName}`);
        if (!existingDataSource.equals(dataSource)) {
          self.setState({
            dataSources: <List<DataSource>>dataSources.map((ds) => ds.name === dataSourceName ? dataSource : ds)
          });
        }
        self.setState({ dataSource });
      },
      setFilter: (filter: Filter) => {
        self.setState({ filter });
      },
      changeSplits: (splits: List<SplitCombine>) => {
        self.setState({ splits });
      },
      addSplit: (split: SplitCombine) => {
        var { splits } = this.state;
        self.setState({
          splits: <List<SplitCombine>>splits.concat(split)
        });
      },
      removeSplit: (split: SplitCombine) => {
        var { splits } = this.state;
        self.setState({
          splits: <List<SplitCombine>>splits.filter(s => s !== split)
        });
      },
      pinDimension: (dimension: Dimension) => {
        var { pinnedDimensions } = this.state;
        self.setState({
          pinnedDimensions: pinnedDimensions.add(dimension.name)
        });
      },
      unpinDimension: (dimension: Dimension) => {
        var { pinnedDimensions } = this.state;
        self.setState({
          pinnedDimensions: pinnedDimensions.remove(dimension.name)
        });
      }
    };
  }

  componentWillMount() {
    var { dataSources } = this.props;
    var { dataSource, selectedMeasures } = this.state;
    if (dataSources.size && !dataSource) {
      dataSource = dataSources.first();
      this.setState({
        dataSources,
        dataSource: dataSource,
        selectedMeasures: OrderedSet(dataSource.measures.toArray().slice(0, 4).map(m => m.name)),
        pinnedDimensions: OrderedSet(dataSource.dimensions.toArray().slice(0, 2).map(d => d.name))
      });
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  canDrop(e: DragEvent) {
    return dataTransferTypesContain(e.dataTransfer.types, "text/dimension");
  }

  dragOver(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
  }

  dragEnter(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dragOver } = this.state;
    if (!dragOver) {
      this.dragCounter = 0;
      this.setState({
        dragOver: true
      });
    } else {
      this.dragCounter++;
    }
  }

  dragLeave(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dragOver } = this.state;
    if (!dragOver) return;
    if (this.dragCounter === 0) {
      this.setState({
        dragOver: false
      });
    } else {
      this.dragCounter--;
    }
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    this.dragCounter = 0;
    var dimensionName = e.dataTransfer.getData("text/dimension");
    this.setState({
      dragOver: false,
      splits: List([new SplitCombine($(dimensionName), null, null)]) // should use clicker
    });
  }

  sideDrawerOpen(state: boolean): void {
    this.setState({ drawerOpen: state });
  }

  render() {
    var clicker = this.clicker;
    var {
      dataSources, dataSource, filter, splits, selectedMeasures, pinnedDimensions,
      dragOver, drawerOpen
    } = this.state;

    var measures = dataSource.measures;

    // <TimeSeriesVis dispatcher={basicDispatcher} filter={filter} measures={measures}/>

    var visualization = React.createElement(NestedTableVis, {
      dataSource: dataSource,
      filter: filter,
      splits: splits,
      measures: selectedMeasures.toList().map(measureName => measures.find((measure) => measure.name === measureName))
    });

    var dropIndicator: React.ReactElement<any> = null;
    if (dragOver) {
      dropIndicator = JSX(`<DropIndicator/>`);
    }

    var sideDrawer: React.ReactElement<any> = null;
    if (drawerOpen) {
      var closeSideDrawer: () => void = this.sideDrawerOpen.bind(this, false);
      sideDrawer = React.createElement(SideDrawer, {
        key: 'drawer',
        clicker,
        dataSources,
        selectedDataSource: dataSource.name,
        onClose: closeSideDrawer
      });
    }

    return JSX(`
      <main className='application'>
        <HeaderBar dataSource={dataSource} onNavClick={this.sideDrawerOpen.bind(this, true)}/>
        <div className='container'>
          <FilterSplitPanel dataSource={dataSource} clicker={clicker} filter={filter} splits={splits}/>
          <div
            className='vis-pane'
            onDragOver={this.dragOver.bind(this)}
            onDragEnter={this.dragEnter.bind(this)}
            onDragLeave={this.dragLeave.bind(this)}
            onDrop={this.drop.bind(this)}
          >
            <VisBar/>
            <div className='visualization'>{visualization}</div>
            {dropIndicator}
          </div>
          <PinboardPanel
            clicker={clicker}
            dataSource={dataSource}
            filter={filter}
            selectedMeasures={selectedMeasures}
            pinnedDimensions={pinnedDimensions}
          />
        </div>
        <ReactCSSTransitionGroup component="div" className="side-drawer-container" transitionName="side-drawer">
          {sideDrawer}
        </ReactCSSTransitionGroup>
      </main>
    `);
  }
}

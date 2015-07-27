'use strict';

import React = require('react/addons');
import { List } from 'immutable';
import { $, Expression, Datum, Dataset, NativeDataset, TimeRange, Dispatcher, find } from 'plywood';
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
  selectedMeasures?: List<Measure>;
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
        selectedMeasures: <List<Measure>>dataSource.measures.slice(0, 4)
      });
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  dragOver(e: DragEvent) {
    e.preventDefault();
  }

  dragEnter(e: DragEvent) {
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
    this.dragCounter = 0;
    var dataTransfer = e.dataTransfer;
    //ToDo: if (!dataTransfer.types.contains("text/dimension")) return;
    var dimensionName = dataTransfer.getData("text/dimension");
    this.setState({
      dragOver: false,
      splits: List([new SplitCombine($(dimensionName), null, null)]) // should use clicker
    });
  }

  openSideDrawer() {
    this.setState({ drawerOpen: true });
  }

  closeSideDrawer() {
    this.setState({ drawerOpen: false });
  }

  render() {
    var clicker = this.clicker;
    var { dataSources, dataSource, filter, splits, dragOver, drawerOpen, selectedMeasures } = this.state;

    // <TimeSeriesVis dispatcher={basicDispatcher} filter={filter} measures={measures}/>

    var visualization = React.createElement(NestedTableVis, {
      dataSource: dataSource,
      filter: filter,
      splits: splits,
      measures: selectedMeasures
    });

    var dropIndicator: React.ReactElement<any> = null;
    if (dragOver) {
      dropIndicator = JSX(`<DropIndicator/>`);
    }

    var sideDrawer: React.ReactElement<any> = null;
    if (drawerOpen) {
      sideDrawer = React.createElement(<any>SideDrawer, {
        key: 'drawer',
        clicker,
        dataSources,
        selectedDataSource: dataSource,
        onClose: this.closeSideDrawer.bind(this)
      });
    }

    return JSX(`
      <main className='application'>
        <HeaderBar dataSource={dataSource} onNavClick={this.openSideDrawer.bind(this)}/>
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
          <PinboardPanel/>
        </div>
        <ReactCSSTransitionGroup component="div" className="side-drawer-container" transitionName="side-drawer">
          {sideDrawer}
        </ReactCSSTransitionGroup>
      </main>
    `);
  }
}

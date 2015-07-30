'use strict';

import * as React from 'react/addons';
import { List, OrderedSet } from 'immutable';
import { Timezone } from "chronology";
import { $, Expression, Datum, Dataset, NativeDataset, TimeRange, Dispatcher, ChainExpression } from 'plywood';
import { dataTransferTypesContain } from '../../utils/dom';
import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource } from "../../models/index";

import { HeaderBar } from '../header-bar/header-bar';
import { FilterSplitPanel } from '../filter-split-panel/filter-split-panel';
import { VisBar } from '../vis-bar/vis-bar';
import { DropIndicator } from '../drop-indicator/drop-indicator';
import { SideDrawer } from '../side-drawer/side-drawer';
import { PinboardPanel } from '../pinboard-panel/pinboard-panel';
import { TimeSeriesVis } from '../time-series-vis/time-series-vis';
import { NestedTableVis } from '../nested-table-vis/nested-table-vis';

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
  visualization?: string;
  visualizations?: List<string>;
  visualizationStage?: ClientRect;
  timezone?: Timezone;
  dragOver?: boolean;
  drawerOpen?: boolean;
}

export class Application extends React.Component<ApplicationProps, ApplicationState> {
  private clicker: Clicker;
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      timezone: Timezone.UTC,
      filter: new Filter(List([
        $('time').in(TimeRange.fromJS({
          start: new Date('2013-02-26T00:00:00Z'),
          end: new Date('2013-02-27T00:00:00Z')
        }))
      ])),
      splits: <List<SplitCombine>>List()
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
        var { dataSource } = self.state;
        self.setState({
          splits,
          visualizations: self.getPossibleVisualizations(dataSource, splits)
        });
      },
      addSplit: (split: SplitCombine) => {
        var { dataSource, splits } = this.state;
        splits = <List<SplitCombine>>splits.concat(split);
        self.setState({
          splits,
          visualizations: self.getPossibleVisualizations(dataSource, splits)
        });
      },
      removeSplit: (split: SplitCombine) => {
        var { dataSource, splits } = this.state;
        splits = <List<SplitCombine>>splits.filter(s => s !== split);
        self.setState({
          splits,
          visualizations: self.getPossibleVisualizations(dataSource, splits)
        });
      },
      selectVisualization: (visualization: string) => {
        var { visualizations } = this.state;
        if (!visualizations.includes(visualization)) return;
        self.setState({
          visualization
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

    this.globalResizeListener = this.globalResizeListener.bind(this);
  }

  componentWillMount() {
    var { dataSources } = this.props;
    var { dataSource, selectedMeasures, splits } = this.state;
    if (dataSources.size && !dataSource) {
      dataSource = dataSources.first();
      splits = List([dataSource.getDimension('time').getSplitCombine()]);
      var visualizations = this.getPossibleVisualizations(dataSource, splits);
      this.setState({
        dataSources,
        dataSource: dataSource,
        splits,
        selectedMeasures: OrderedSet(dataSource.measures.toArray().slice(0, 4).map(m => m.name)),
        pinnedDimensions: OrderedSet(dataSource.dimensions.toArray().slice(0, 2).map(d => d.name)),
        visualizations: visualizations,
        visualization: visualizations.last()
      });
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.globalResizeListener);
  }

  globalResizeListener() {
    var { visualization } = this.refs;
    this.setState({
      visualizationStage: React.findDOMNode(visualization).getBoundingClientRect()
    });
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
      this.setState({ dragOver: true });
    } else {
      this.dragCounter++;
    }
  }

  dragLeave(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dragOver } = this.state;
    if (!dragOver) return;
    if (this.dragCounter === 0) {
      this.setState({ dragOver: false });
    } else {
      this.dragCounter--;
    }
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dataSource } = this.state;
    this.dragCounter = 0;
    var dimension = dataSource.getDimension(e.dataTransfer.getData("text/dimension"));
    this.setState({ dragOver: false });
    if (dimension) {
      this.clicker.changeSplits(List([dimension.getSplitCombine()]));
    }
  }

  sideDrawerOpen(state: boolean): void {
    this.setState({ drawerOpen: state });
  }

  getPossibleVisualizations(dataSource: DataSource, splits: List<SplitCombine>): List<string> {
    var visArray: string[] = ['nested-table-vis'];

    if (splits.size === 1) {
      var firstSplit = splits.first();
      var splitDimension = dataSource.getDimension(firstSplit.dimension);
      if (splitDimension.type === 'TIME') {
        visArray.push('time-series-vis');
      }
    }

    return List(visArray);
  }

  render() {
    var clicker = this.clicker;
    var {
      dataSources, dataSource, filter, splits, selectedMeasures, pinnedDimensions, timezone,
      visualizations, visualization, visualizationStage,
      dragOver, drawerOpen
    } = this.state;

    var measures = dataSource.measures;

    var visElement: React.ReactElement<any> = null;
    if (visualization === 'time-series-vis') {
      visElement = React.createElement(TimeSeriesVis, {
        dataSource: dataSource,
        filter: filter,
        splits: splits,
        measures: selectedMeasures.toList().map(measureName => measures.find((measure) => measure.name === measureName)),
        stage: visualizationStage
      });
    } else {
      visElement = React.createElement(NestedTableVis, {
        dataSource: dataSource,
        filter: filter,
        splits: splits,
        measures: selectedMeasures.toList().map(measureName => measures.find((measure) => measure.name === measureName)),
        stage: visualizationStage
      });
    }

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
          <FilterSplitPanel
            dataSource={dataSource}
            clicker={clicker}
            filter={filter}
            splits={splits}
            timezone={timezone}
          />
          <div
            className='vis-pane'
            onDragOver={this.dragOver.bind(this)}
            onDragEnter={this.dragEnter.bind(this)}
            onDragLeave={this.dragLeave.bind(this)}
            onDrop={this.drop.bind(this)}
          >
            <VisBar clicker={clicker} visualizations={visualizations} visualization={visualization}/>
            <div className='visualization' ref='visualization'>{visElement}</div>
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

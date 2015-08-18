'use strict';

import * as React from 'react/addons';
import { List, OrderedSet } from 'immutable';
import { Timezone, Duration } from 'chronology';
import { $, Expression, Datum, Dataset, TimeRange, Dispatcher, ChainExpression } from 'plywood';
import { dataTransferTypesContain } from '../../utils/dom';
import { Stage, Filter, Dimension, Measure, SplitCombine, Clicker, DataSource } from "../../models/index";

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
  pinnedMeasures?: boolean;
  pinnedDimensions?: OrderedSet<string>;
  visualization?: string;
  visualizations?: List<string>;
  visualizationStage?: Stage;
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
      filter: new Filter(),
      splits: <List<SplitCombine>>List(),
      pinnedMeasures: true
    };

    var clicker = {
      changeDataSource: (dataSource: DataSource) => {
        var { dataSources } = this.state;
        var dataSourceName = dataSource.name;
        var existingDataSource = dataSources.find((ds) => ds.name === dataSourceName);
        if (!existingDataSource) throw new Error(`unknown DataSource changed: ${dataSourceName}`);

        var newState: ApplicationState = { dataSource };
        if (!existingDataSource.equals(dataSource)) {
          // We are actually updating info within the named dataSource
          newState.dataSources = <List<DataSource>>dataSources.map((ds) => ds.name === dataSourceName ? dataSource : ds);
        }
        this.setState(newState);
      },
      changeFilter: (filter: Filter) => {
        this.setState({ filter });
      },
      changeSplits: (splits: List<SplitCombine>) => {
        var { dataSource, visualization } = this.state;
        var visualizations = this.getPossibleVisualizations(dataSource, splits);
        if (!visualizations.contains(visualization)) visualization = visualizations.get(0);
        this.setState({
          splits,
          visualization,
          visualizations
        });
      },
      addSplit: (split: SplitCombine) => {
        var { splits } = this.state;
        clicker.changeSplits(<List<SplitCombine>>splits.concat(split));
      },
      removeSplit: (split: SplitCombine) => {
        var { splits } = this.state;
        clicker.changeSplits(<List<SplitCombine>>splits.filter(s => s !== split));
      },
      selectVisualization: (visualization: string) => {
        var { visualizations } = this.state;
        if (!visualizations.includes(visualization)) return;
        this.setState({
          visualization
        });
      },
      pin: (what: string | Dimension) => {
        if (what instanceof Dimension) {
          var { pinnedDimensions } = this.state;
          this.setState({
            pinnedDimensions: pinnedDimensions.add(what.name)
          });
        } else if (what === 'measures') {
          this.setState({
            pinnedMeasures: true
          });
        } else {
          throw new Error('bad pin parameter');
        }
      },
      unpin: (what: string | Dimension) => {
        if (what instanceof Dimension) {
          var { pinnedDimensions } = this.state;
          this.setState({
            pinnedDimensions: pinnedDimensions.remove(what.name)
          });
        } else if (what === 'measures') {
          this.setState({
            pinnedMeasures: false
          });
        } else {
          throw new Error('bad pin parameter');
        }
      },
      toggleMeasure: (measure: Measure) => {
        var { selectedMeasures } = this.state;
        var measureName = measure.name;
        selectedMeasures = selectedMeasures.has(measureName) ?
          selectedMeasures.delete(measureName) :
          selectedMeasures.add(measureName);

        this.setState({ selectedMeasures });
      }
    };

    this.clicker = clicker;
    this.globalResizeListener = this.globalResizeListener.bind(this);
  }

  componentWillMount() {
    var { dataSources } = this.props;
    var { dataSource } = this.state;

    this.setState({ dataSources });

    if (dataSources.size && !dataSource) {
      dataSource = dataSources.first();
      this.setState({ dataSource });
    }

    if (!dataSource) return;

    if (dataSource.metadataLoaded) {
      this.fillInDetails(dataSource);
    } else {
      dataSource.loadSource().then((newDataSource) => {
        this.clicker.changeDataSource(newDataSource);
        this.fillInDetails(newDataSource);
      }).done();
    }
  }

  fillInDetails(dataSource: DataSource) {
    var timeRange: TimeRange;

    if ((<any>window)['now'] === 'now') {
      var day = Duration.fromJS('P1D');
      var now = day.floor(new Date(), Timezone.UTC);
      timeRange = TimeRange.fromJS({
        start: day.move(now, Timezone.UTC, -2),
        end: day.move(now, Timezone.UTC, 1)
      });
    } else {
      timeRange = TimeRange.fromJS({
        start: new Date('2013-02-26T00:00:00Z'),
        end: new Date('2013-02-27T00:00:00Z')
      });
    }

    var filter = new Filter(List([
      $('time').in(timeRange)
    ]));
    var splits = List([
      dataSource.getDimension('time').getSplitCombine()
      //dataSource.getDimension('page').getSplitCombine()
    ]);
    var visualizations = this.getPossibleVisualizations(dataSource, splits);
    this.setState({
      filter,
      splits,
      selectedMeasures: OrderedSet(dataSource.measures.toArray().slice(0, 6).map(m => m.name)),
      pinnedDimensions: OrderedSet(['language', 'page']),
      visualizations: visualizations,
      visualization: visualizations.last()
    });
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
    var visualizationDOM = React.findDOMNode(visualization);
    if (!visualizationDOM) return;
    var visRect = visualizationDOM.getBoundingClientRect();
    this.setState({
      visualizationStage: Stage.fromSize(visRect.width, visRect.height)
    });
  }

  canDrop(e: DragEvent): boolean {
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

  sideDrawerOpen(drawerOpen: boolean): void {
    this.setState({ drawerOpen });
  }

  getPossibleVisualizations(dataSource: DataSource, splits: List<SplitCombine>): List<string> {
    var visArray: string[] = ['nested-table-vis'];

    if (splits.size) {
      var lastSplit = splits.last();
      var splitDimension = dataSource.getDimension(lastSplit.dimension);
      if (splitDimension.type === 'TIME') {
        visArray.push('time-series-vis');
      }
    }

    return List(visArray);
  }

  shouldComponentUpdate(nextProps: ApplicationProps, nextState: ApplicationState): boolean {
    return Boolean(nextState.selectedMeasures) &&
           Boolean(nextState.pinnedDimensions) &&
           Boolean(nextState.visualization);
  }

  render() {
    var clicker = this.clicker;
    var {
      dataSources, dataSource, filter, splits, selectedMeasures, pinnedMeasures, pinnedDimensions, timezone,
      visualizations, visualization, visualizationStage,
      dragOver, drawerOpen
    } = this.state;

    var measures = dataSource.measures;

    var visElement: React.ReactElement<any> = null;
    if (dataSource.metadataLoaded && visualizationStage) {
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
            pinnedMeasures={pinnedMeasures}
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

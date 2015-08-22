'use strict';

import * as React from 'react/addons';
import { List, OrderedSet } from 'immutable';
import { Timezone, Duration } from 'chronology';
import { $, Expression, Datum, Dataset, TimeRange, Executor, ChainExpression } from 'plywood';
import { dataTransferTypesContain } from '../../utils/dom';
import { Stage, Essence, Filter, Dimension, Measure, SplitCombine, Clicker, DataSource } from "../../models/index";

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
  essence?: Essence;
  visualizationStage?: Stage;
  dragOver?: boolean;
  drawerOpen?: boolean;
}

export class Application extends React.Component<ApplicationProps, ApplicationState> {
  private clicker: Clicker;
  private dragCounter: number;
  private hashUpdating: boolean = false;

  constructor() {
    super();
    this.state = {
      essence: null,
      dragOver: false,
      drawerOpen: false
    };

    var clicker = {
      changeDataSource: (dataSource: DataSource) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeDataSource(dataSource) });
      },
      changeFilter: (filter: Filter) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeFilter(filter) });
      },
      changeTimeRange: (timeRange: TimeRange) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeTimeRange(timeRange) });
      },
      changeSplits: (splits: List<SplitCombine>) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeSplits(splits) });
      },
      addSplit: (split: SplitCombine) => {
        var { essence } = this.state;
        this.setState({ essence: essence.addSplit(split) });
      },
      removeSplit: (split: SplitCombine) => {
        var { essence } = this.state;
        this.setState({ essence: essence.removeSplit(split) });
      },
      selectVisualization: (visualization: string) => {
        var { essence } = this.state;
        this.setState({ essence: essence.selectVisualization(visualization) });
      },
      pin: (dimension: Dimension) => {
        var { essence } = this.state;
        this.setState({ essence: essence.pin(dimension) });
      },
      unpin: (dimension: Dimension) => {
        var { essence } = this.state;
        this.setState({ essence: essence.unpin(dimension) });
      },
      toggleMeasure: (measure: Measure) => {
        var { essence } = this.state;
        this.setState({ essence: essence.toggleMeasure(measure) });
      }
    };

    this.clicker = clicker;
    this.globalResizeListener = this.globalResizeListener.bind(this);
    this.globalHashChangeListener = this.globalHashChangeListener.bind(this);
  }

  componentWillMount() {
    var { dataSources } = this.props;
    if (!dataSources.size) throw new Error('must have data sources');
    var dataSource = dataSources.first();

    if (dataSource.metadataLoaded) {
      this.fillInDetails(dataSource);
    } else {
      dataSource.loadSource().then((newDataSource) => {
        this.clicker.changeDataSource(newDataSource);
        this.fillInDetails(newDataSource);
      }).done();
    }
  }

  componentWillUpdate(nextProps: ApplicationProps, nextState: ApplicationState): void {
    this.hashUpdating = true;
    window.location.hash = nextState.essence.toHash();
    // delay unflagging the update so that the hashchange event has a chance to fire a blank
    setTimeout(() => { this.hashUpdating = false; }, 10);
  }

  fillInDetails(dataSource: DataSource) {
    var essence = this.getEssenceFromHash();

    if (!essence) {
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

      essence = new Essence({
        dataSources: this.props.dataSources,
        dataSource: dataSource,
        timezone: Timezone.UTC,
        filter: new Filter({
          operands: List([$('time').in(timeRange)])
        }),
        splits: List([
          dataSource.getDimension('time').getSplitCombine()
          //dataSource.getDimension('page').getSplitCombine()
        ]),
        selectedMeasures: OrderedSet(dataSource.measures.toArray().slice(0, 6).map(m => m.name)),
        pinnedDimensions: OrderedSet(['language', 'page']),
        visualization: null
      });
    }

    this.setState({ essence });
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    window.addEventListener('hashchange', this.globalHashChangeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.globalResizeListener);
    window.removeEventListener('hashchange', this.globalHashChangeListener);
  }

  getDataSources(): List<DataSource> {
    var { essence } = this.state;
    return essence ? essence.dataSources : this.props.dataSources;
  }

  getEssenceFromHash(): Essence {
    var hash = window.location.hash;
    return Essence.fromHash(hash, this.getDataSources());
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

  globalHashChangeListener() {
    if (this.hashUpdating) return;
    var essence = this.getEssenceFromHash();
    if (!essence) return;
    this.setState({ essence });
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
    var { essence } = this.state;
    this.dragCounter = 0;
    var dimension = essence.dataSource.getDimension(e.dataTransfer.getData("text/dimension"));
    this.setState({ dragOver: false });
    if (dimension) {
      this.clicker.changeSplits(List([dimension.getSplitCombine()]));
    }
  }

  sideDrawerOpen(drawerOpen: boolean): void {
    this.setState({ drawerOpen });
  }

  shouldComponentUpdate(nextProps: ApplicationProps, nextState: ApplicationState): boolean {
    return Boolean(nextState.essence);
  }

  render() {
    var clicker = this.clicker;
    var { essence, visualizationStage, dragOver, drawerOpen } = this.state;

    var {
      dataSources, dataSource, filter, splits,
      selectedMeasures, pinnedDimensions, timezone, visualization
    } = essence;

    var visualizations = essence.getVisualizations();

    var measures = dataSource.measures;

    var visElement: React.ReactElement<any> = null;
    if (dataSource.metadataLoaded && visualizationStage) {
      var visProps = {
        clicker,
        dataSource,
        filter,
        splits,
        measures: selectedMeasures.toList().map(measureName => measures.find((measure) => measure.name === measureName)),
        stage: visualizationStage
      };

      if (visualization === 'time-series-vis') {
        visElement = React.createElement(TimeSeriesVis, visProps);
      } else {
        visElement = React.createElement(NestedTableVis, visProps);
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
            clicker={clicker}
            essence={essence}
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

'use strict';

import * as React from 'react/addons';
import { List, OrderedSet } from 'immutable';
import { Timezone, Duration, day } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, Executor, ChainExpression } from 'plywood';
import { dataTransferTypesContain } from '../../utils/dom';
import { Stage, Essence, Filter, Dimension, Measure, Splits, SplitCombine, Clicker, DataSource, Manifest, VisualizationProps } from "../../models/index";

import { HeaderBar } from '../header-bar/header-bar';
import { DimensionListTile } from '../dimension-list-tile/dimension-list-tile';
import { MeasuresTile } from '../measures-tile/measures-tile';
import { FilterTile } from '../filter-tile/filter-tile';
import { SplitTile } from '../split-tile/split-tile';
import { VisSelector } from '../vis-selector/vis-selector';
import { DropIndicator } from '../drop-indicator/drop-indicator';
import { SideDrawer } from '../side-drawer/side-drawer';
import { PinboardPanel } from '../pinboard-panel/pinboard-panel';

import { visualizations } from '../../visualizations/index';

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

interface ApplicationProps {
  dataSources: List<DataSource>;
}

interface ApplicationState {
  essence?: Essence;
  menuStage?: Stage;
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
      changeSplits: (splits: Splits) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeSplits(splits) });
      },
      changeSplit: (split: SplitCombine) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeSplit(split) });
      },
      addSplit: (split: SplitCombine) => {
        var { essence } = this.state;
        this.setState({ essence: essence.addSplit(split) });
      },
      removeSplit: (split: SplitCombine) => {
        var { essence } = this.state;
        this.setState({ essence: essence.removeSplit(split) });
      },
      selectVisualization: (visualization: Manifest) => {
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
      },
      changeHighlight: (owner: string, delta: Filter) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeHighlight(owner, delta) });
      },
      acceptHighlight: () => {
        var { essence } = this.state;
        this.setState({ essence: essence.acceptHighlight() });
      },
      dropHighlight: () => {
        var { essence } = this.state;
        this.setState({ essence: essence.dropHighlight() });
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
      var now = dataSource.getMaxTime();
      var timeRange = TimeRange.fromJS({
        start: day.move(now, Timezone.UTC, -3),
        end: now
      });

      essence = new Essence({
        dataSources: this.props.dataSources,
        visualizations: visualizations,

        dataSource: dataSource,
        timezone: Timezone.UTC,
        filter: new Filter(List([dataSource.timeAttribute.in(timeRange)])),
        splits: Splits.EMPTY,
        selectedMeasures: OrderedSet(dataSource.measures.toArray().slice(0, 6).map(m => m.name)),
        pinnedDimensions: OrderedSet([dataSource.dimensions.get(1).name, dataSource.dimensions.get(5).name]),
        visualization: null,
        compare: null,
        highlight: null
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
    return Essence.fromHash(hash, this.getDataSources(), visualizations);
  }

  globalResizeListener() {
    var { container, visualization } = this.refs;
    var containerDOM = React.findDOMNode(container);
    var visualizationDOM = React.findDOMNode(visualization);
    if (!containerDOM || !visualizationDOM) return;
    this.setState({
      menuStage: Stage.fromClientRect(containerDOM.getBoundingClientRect()),
      visualizationStage: Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
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
      this.clicker.changeSplit(dimension.getSplitCombine());
    }
  }

  triggerFilterMenu(dimension: Dimension) {
    if (!dimension) return;
    (<FilterTile>this.refs['filterTile']).possibleDimensionAppend(dimension);
  }

  sideDrawerOpen(drawerOpen: boolean): void {
    this.setState({ drawerOpen });
  }

  shouldComponentUpdate(nextProps: ApplicationProps, nextState: ApplicationState): boolean {
    return Boolean(nextState.essence);
  }

  render() {
    var clicker = this.clicker;
    var { essence, menuStage, visualizationStage, dragOver, drawerOpen } = this.state;
    var { dataSources, dataSource, visualization } = essence;

    var visElement: React.ReactElement<any> = null;
    if (dataSource.metadataLoaded && visualizationStage) {
      var visProps: VisualizationProps = {
        clicker,
        essence,
        stage: visualizationStage
      };

      visElement = React.createElement(<any>visualization, visProps);
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
      <main className='application' id='portal-cont'>
        <HeaderBar essence={essence} onNavClick={this.sideDrawerOpen.bind(this, true)}/>
        <div className='container' ref='container'>
          <div className='dimension-measure-panel'>
            <DimensionListTile clicker={clicker} essence={essence} menuStage={menuStage} onFilter={this.triggerFilterMenu.bind(this)}/>
            <MeasuresTile clicker={clicker} essence={essence}/>
          </div>
          <div className='center-panel'>
            <div className='center-top-bar'>
              <div className='filter-split-section'>
                <FilterTile ref="filterTile" clicker={clicker} essence={essence} menuStage={visualizationStage}/>
                <SplitTile clicker={clicker} essence={essence} menuStage={visualizationStage}/>
              </div>
              <VisSelector clicker={clicker} essence={essence}/>
            </div>
            <div
              className='center-main'
              onDragOver={this.dragOver.bind(this)}
              onDragEnter={this.dragEnter.bind(this)}
              onDragLeave={this.dragLeave.bind(this)}
              onDrop={this.drop.bind(this)}
            >
              <div className='visualization' ref='visualization'>{visElement}</div>
              {dropIndicator}
            </div>
          </div>
          <PinboardPanel clicker={clicker} essence={essence}/>
        </div>
        <ReactCSSTransitionGroup component="div" className="side-drawer-container" transitionName="side-drawer">
          {sideDrawer}
        </ReactCSSTransitionGroup>
      </main>
    `);
  }
}

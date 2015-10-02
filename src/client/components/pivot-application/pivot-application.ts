'use strict';

import * as React from 'react/addons';
import { List, OrderedSet } from 'immutable';
import { Timezone, Duration } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, Executor, ChainExpression } from 'plywood';
import { dataTransferTypesGet } from '../../utils/dom/dom';
import { Stage, Essence, Filter, Dimension, Measure, Splits, SplitCombine, Clicker, DataSource, Manifest, VisualizationProps } from "../../../common/models/index";

import { HeaderBar } from '../header-bar/header-bar';
import { DimensionListTile } from '../dimension-list-tile/dimension-list-tile';
import { MeasuresTile } from '../measures-tile/measures-tile';
import { FilterTile } from '../filter-tile/filter-tile';
import { SplitTile } from '../split-tile/split-tile';
import { VisSelector } from '../vis-selector/vis-selector';
import { ManualFallback } from '../manual-fallback/manual-fallback';
import { DropIndicator } from '../drop-indicator/drop-indicator';
import { SideDrawer } from '../side-drawer/side-drawer';
import { PinboardPanel } from '../pinboard-panel/pinboard-panel';

import { visualizations } from '../../visualizations/index';

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

export interface PivotApplicationProps {
  version: string;
  dataSources: List<DataSource>;
}

export interface PivotApplicationState {
  essence?: Essence;
  menuStage?: Stage;
  visualizationStage?: Stage;
  dragOver?: boolean;
  drawerOpen?: boolean;
}

export class PivotApplication extends React.Component<PivotApplicationProps, PivotApplicationState> {
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
      changeSplits: (splits: Splits, fitVis: boolean) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeSplits(splits, fitVis) });
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
      changeVisualization: (visualization: Manifest) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeVisualization(visualization) });
      },
      pin: (dimension: Dimension) => {
        var { essence } = this.state;
        this.setState({ essence: essence.pin(dimension) });
      },
      unpin: (dimension: Dimension) => {
        var { essence } = this.state;
        this.setState({ essence: essence.unpin(dimension) });
      },
      changePinnedSortMeasure: (measure: Measure) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changePinnedSortMeasure(measure) });
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
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { dataSources } = this.props;
    if (!dataSources.size) throw new Error('must have data sources');
    var dataSource = dataSources.first();

    var essence = this.getEssenceFromHash() || Essence.fromDataSource(dataSource, dataSources, visualizations);
    this.setState({ essence });
  }

  componentWillUpdate(nextProps: PivotApplicationProps, nextState: PivotApplicationState): void {
    this.hashUpdating = true;
    window.location.hash = nextState.essence.toHash();
    // delay unflagging the update so that the hashchange event has a chance to fire a blank
    setTimeout(() => { this.hashUpdating = false; }, 10);
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    window.addEventListener('hashchange', this.globalHashChangeListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.globalResizeListener);
    window.removeEventListener('hashchange', this.globalHashChangeListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
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

  globalKeyDownListener(e: KeyboardEvent) {
    // Shortcuts will go here one day
  }

  canDrop(e: DragEvent): boolean {
    return Boolean(dataTransferTypesGet(e.dataTransfer.types, "dimension"));
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
    e.preventDefault();
    var { essence } = this.state;
    this.dragCounter = 0;
    var dimensionName = dataTransferTypesGet(e.dataTransfer.types, "dimension");
    if (dimensionName) {
      var dimension = essence.dataSource.getDimension(dimensionName);
      if (dimension) this.clicker.changeSplit(SplitCombine.fromExpression(dimension.expression));
    }
    this.setState({ dragOver: false });
  }

  triggerFilterMenu(dimension: Dimension) {
    if (!dimension) return;
    (<FilterTile>this.refs['filterTile']).possibleDimensionAppend(dimension);
  }

  sideDrawerOpen(drawerOpen: boolean): void {
    this.setState({ drawerOpen });
  }

  shouldComponentUpdate(nextProps: PivotApplicationProps, nextState: PivotApplicationState): boolean {
    return Boolean(nextState.essence);
  }

  render() {
    var clicker = this.clicker;
    var { essence, menuStage, visualizationStage, dragOver, drawerOpen } = this.state;

    if (!essence) return null;
    var { dataSource, visualization } = essence;

    var visElement: React.ReactElement<any> = null;
    if (essence.visResolve.isReady() && visualizationStage) {
      var visProps: VisualizationProps = {
        clicker,
        essence,
        stage: visualizationStage
      };

      visElement = React.createElement(<any>visualization, visProps);
    }

    var manualFallback: React.ReactElement<any> = null;
    if (essence.visResolve.isManual()) {
      manualFallback = React.createElement(ManualFallback, {
        clicker,
        essence
      });
    }

    var dropIndicator: React.ReactElement<any> = null;
    if (dragOver) {
      dropIndicator = React.createElement(DropIndicator, null);
    }

    var sideDrawer: React.ReactElement<any> = null;
    if (drawerOpen) {
      var closeSideDrawer: () => void = this.sideDrawerOpen.bind(this, false);
      sideDrawer = React.createElement(SideDrawer, {
        key: 'drawer',
        clicker,
        essence,
        onClose: closeSideDrawer
      });
    }

    var sideDrawerTransition = React.createElement(<any>ReactCSSTransitionGroup, {
      component: "div",
      className: "side-drawer-container",
      transitionName: "side-drawer"
    }, sideDrawer);

    return JSX(`
      <main className='pivot-application' id='portal-cont'>
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
              {manualFallback}
              {dropIndicator}
            </div>
          </div>
          <PinboardPanel clicker={clicker} essence={essence}/>
        </div>
        {sideDrawerTransition}
      </main>
    `);
  }
}

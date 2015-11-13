'use strict';
require('./pivot-application.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { List, OrderedSet } from 'immutable';
import { Timezone, Duration } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, Executor, ChainExpression } from 'plywood';
import { dataTransferTypesGet } from '../../utils/dom/dom';
import { Stage, Essence, VisStrategy, Filter, Dimension, Measure, Splits,
         SplitCombine, Clicker, DataSource, Manifest, Colors, VisualizationProps } from "../../../common/models/index";

import { HeaderBar } from '../header-bar/header-bar';
import { DimensionMeasurePanel } from '../dimension-measure-panel/dimension-measure-panel';
import { FilterTile } from '../filter-tile/filter-tile';
import { SplitTile } from '../split-tile/split-tile';
import { VisSelector } from '../vis-selector/vis-selector';
import { ManualFallback } from '../manual-fallback/manual-fallback';
import { DropIndicator } from '../drop-indicator/drop-indicator';
import { PinboardPanel } from '../pinboard-panel/pinboard-panel';
import { SideDrawer, SideDrawerProps } from '../side-drawer/side-drawer';

import { visualizations } from '../../visualizations/index';

export interface PivotApplicationProps extends React.Props<any> {
  version: string;
  dataSources: List<DataSource>;
  homeLink?: string;
  showLastUpdated?: boolean;
}

export interface PivotApplicationState {
  ReactCSSTransitionGroupAsync?: typeof ReactCSSTransitionGroup;
  SideDrawerAsync?: typeof SideDrawer;
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
      ReactCSSTransitionGroupAsync: null,
      SideDrawerAsync: null,
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
      changeSplits: (splits: Splits, strategy: VisStrategy) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeSplits(splits, strategy) });
      },
      changeSplit: (split: SplitCombine, strategy: VisStrategy) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeSplit(split, strategy) });
      },
      addSplit: (split: SplitCombine, strategy: VisStrategy) => {
        var { essence } = this.state;
        this.setState({ essence: essence.addSplit(split, strategy) });
      },
      removeSplit: (split: SplitCombine, strategy: VisStrategy) => {
        var { essence } = this.state;
        this.setState({ essence: essence.removeSplit(split, strategy) });
      },
      changeColors: (colors: Colors) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeColors(colors) });
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

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    window.addEventListener('hashchange', this.globalHashChangeListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
    this.globalResizeListener();

    require.ensure([
      'react-addons-css-transition-group',
      '../side-drawer/side-drawer'
    ], (require) => {
      this.setState({
        ReactCSSTransitionGroupAsync: require('react-addons-css-transition-group'),
        SideDrawerAsync: require('../side-drawer/side-drawer').SideDrawer
      });
    }, 'side-drawer');
  }

  componentWillUpdate(nextProps: PivotApplicationProps, nextState: PivotApplicationState): void {
    this.hashUpdating = true;
    window.location.hash = nextState.essence.toHash();
    // delay unflagging the update so that the hashchange event has a chance to fire a blank
    setTimeout(() => {
      this.hashUpdating = false;
    }, 10);
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
    var containerDOM = ReactDOM.findDOMNode(container);
    var visualizationDOM = ReactDOM.findDOMNode(visualization);
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
      if (dimension) this.clicker.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.FairGame);
    }
    this.setState({ dragOver: false });
  }

  triggerFilterMenu(dimension: Dimension) {
    if (!dimension) return;
    (this.refs['filterTile'] as FilterTile).filterMenuRequest(dimension);
  }

  triggerSplitMenu(dimension: Dimension) {
    if (!dimension) return;
    (this.refs['splitTile'] as SplitTile).splitMenuRequest(dimension);
  }

  sideDrawerOpen(drawerOpen: boolean): void {
    this.setState({ drawerOpen });
  }

  shouldComponentUpdate(nextProps: PivotApplicationProps, nextState: PivotApplicationState): boolean {
    return Boolean(nextState.essence);
  }

  render() {
    var clicker = this.clicker;
    var { homeLink, showLastUpdated } = this.props;
    var { ReactCSSTransitionGroupAsync, SideDrawerAsync, essence, menuStage, visualizationStage, dragOver, drawerOpen } = this.state;

    if (!essence) return null;
    var { dataSource, visualization } = essence;

    var visElement: JSX.Element = null;
    if (essence.visResolve.isReady() && visualizationStage) {
      var visProps: VisualizationProps = {
        clicker,
        essence,
        stage: visualizationStage
      };

      visElement = React.createElement(visualization as any, visProps);
    }

    var manualFallback: JSX.Element = null;
    if (essence.visResolve.isManual()) {
      manualFallback = React.createElement(ManualFallback, {
        clicker,
        essence
      });
    }

    var dropIndicator: JSX.Element = null;
    if (dragOver) {
      dropIndicator = <DropIndicator/>;
    }

    var sideDrawer: JSX.Element = null;
    if (drawerOpen && SideDrawerAsync) {
      var closeSideDrawer: () => void = this.sideDrawerOpen.bind(this, false);
      sideDrawer = <SideDrawerAsync
        key='drawer'
        clicker={clicker}
        essence={essence}
        onClose={closeSideDrawer}
        homeLink={homeLink}
      />;
    }

    if (ReactCSSTransitionGroupAsync) {
      var sideDrawerTransition = <ReactCSSTransitionGroupAsync
        component="div"
        className="side-drawer-container"
        transitionName="side-drawer"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {sideDrawer}
      </ReactCSSTransitionGroupAsync>;
    }

    return <main className='pivot-application' id='portal-cont'>
      <HeaderBar essence={essence} onNavClick={this.sideDrawerOpen.bind(this, true)} showLastUpdated={showLastUpdated}/>
      <div className='container' ref='container'>
        <DimensionMeasurePanel
          clicker={clicker}
          essence={essence}
          menuStage={menuStage}
          triggerFilterMenu={this.triggerFilterMenu.bind(this)}
          triggerSplitMenu={this.triggerSplitMenu.bind(this)}
        />
        <div className='center-panel'>
          <div className='center-top-bar'>
            <div className='filter-split-section'>
              <FilterTile ref="filterTile" clicker={clicker} essence={essence} menuStage={visualizationStage}/>
              <SplitTile ref="splitTile" clicker={clicker} essence={essence} menuStage={visualizationStage}/>
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
    </main>;
  }
}

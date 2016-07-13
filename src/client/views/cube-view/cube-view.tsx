/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('./cube-view.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Expression, Dataset } from 'plywood';
import { Timezone } from 'chronoshift';
import { Fn } from '../../../common/utils/general/general';
import { FunctionSlot } from '../../utils/function-slot/function-slot';
import { DragManager } from '../../utils/drag-manager/drag-manager';
import { Colors, Clicker, DataSource, Dimension, Essence, Filter, Stage, Measure,
  SplitCombine, Splits, VisStrategy, VisualizationProps, User, Customization, Manifest } from '../../../common/models/index';
import { MANIFESTS } from '../../../common/manifests/index';

import { CubeHeaderBar } from '../../components/cube-header-bar/cube-header-bar';
import { DimensionMeasurePanel } from '../../components/dimension-measure-panel/dimension-measure-panel';
import { FilterTile } from '../../components/filter-tile/filter-tile';
import { SplitTile } from '../../components/split-tile/split-tile';
import { VisSelector } from '../../components/vis-selector/vis-selector';
import { ManualFallback } from '../../components/manual-fallback/manual-fallback';
import { DropIndicator } from '../../components/drop-indicator/drop-indicator';
import { PinboardPanel } from '../../components/pinboard-panel/pinboard-panel';
import { RawDataModal } from '../../components/raw-data-modal/raw-data-modal';
import { ResizeHandle } from '../../components/resize-handle/resize-handle';

import { getVisualizationComponent } from '../../visualizations/index';
import * as localStorage from '../../utils/local-storage/local-storage';

export interface CubeViewLayout {
  dimensionPanelWidth: number;
  pinboardWidth: number;
}

export interface CubeViewProps extends React.Props<any> {
  maxFilters?: number;
  maxSplits?: number;
  user?: User;
  hash: string;
  updateViewHash: (newHash: string, force?: boolean) => void;
  getUrlPrefix?: () => string;
  dataSource: DataSource;
  onNavClick?: Fn;
  customization?: Customization;
  transitionFnSlot?: FunctionSlot<string>;
}

export interface CubeViewState {
  essence?: Essence;
  visualizationStage?: Stage;
  menuStage?: Stage;
  dragOver?: boolean;
  showRawDataModal?: boolean;
  RawDataModalAsync?: typeof RawDataModal;
  layout?: CubeViewLayout;
  deviceSize?: string;
  updatingMaxTime?: boolean;
}

const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 400;

export class CubeView extends React.Component<CubeViewProps, CubeViewState> {
  static defaultProps = {
    maxFilters: 20,
    maxSplits: 3
  };


  public mounted: boolean;
  private clicker: Clicker;
  private downloadableDataset: Dataset;

  constructor() {
    super();

    this.state = {
      essence: null,
      dragOver: false,
      showRawDataModal: false,
      layout: this.getStoredLayout(),
      updatingMaxTime: false
    };

    var clicker = {
      changeFilter: (filter: Filter, colors?: Colors) => {
        var { essence } = this.state;
        essence = essence.changeFilter(filter);
        if (colors) essence = essence.changeColors(colors);
        this.setState({ essence });
      },
      changeTimeSelection: (selection: Expression) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeTimeSelection(selection) });
      },
      changeSplits: (splits: Splits, strategy: VisStrategy, colors?: Colors) => {
        var { essence } = this.state;
        if (colors) essence = essence.changeColors(colors);
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
      toggleMultiMeasureMode: () => {
        var { essence } = this.state;
        this.setState({ essence: essence.toggleMultiMeasureMode() });
      },
      toggleEffectiveMeasure: (measure: Measure) => {
        var { essence } = this.state;
        this.setState({ essence: essence.toggleEffectiveMeasure(measure) });
      },
      changeHighlight: (owner: string, measure: string, delta: Filter) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeHighlight(owner, measure, delta) });
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
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  refreshMaxTime() {
    var { essence } = this.state;
    var { dataSource } = essence;
    this.setState({ updatingMaxTime: true });

    DataSource.updateMaxTime(dataSource)
      .then((updatedDataSource) => {
        if (!this.mounted) return;
        this.setState({ essence: essence.updateDataSource(updatedDataSource), updatingMaxTime: false  });
      });
  }

  componentWillMount() {
    var { hash, dataSource, updateViewHash } = this.props;
    var essence = this.getEssenceFromHash(dataSource, hash);
    if (!essence) {
      if (!dataSource) throw new Error('must have data source');
      essence = this.getEssenceFromDataSource(dataSource);
      updateViewHash(essence.toHash(), true);
    }
    this.setState({ essence });
  }

  componentDidMount() {
    const { transitionFnSlot } = this.props;

    this.mounted = true;
    DragManager.init();
    window.addEventListener('resize', this.globalResizeListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
    this.globalResizeListener();

    if (transitionFnSlot) {
      transitionFnSlot.fill((oldDataSource: DataSource, newDataSource: DataSource) => {
        if (newDataSource === oldDataSource || !newDataSource.sameGroup(oldDataSource)) return null;
        const { essence } = this.state;
        if (!essence) return null;
        return '#' + newDataSource.name + '/' + essence.updateDataSource(newDataSource).toHash();
      });
    }

    require.ensure(['../../components/raw-data-modal/raw-data-modal'], (require) => {
      this.setState({
        RawDataModalAsync: require('../../components/raw-data-modal/raw-data-modal').RawDataModal
      });
    }, 'raw-data-modal');
  }

  componentWillReceiveProps(nextProps: CubeViewProps) {
    const { hash, dataSource, updateViewHash } = this.props;
    if (!nextProps.dataSource) throw new Error('must have data source');

    if (dataSource.name !== nextProps.dataSource.name || hash !== nextProps.hash) {
      var hashEssence = this.getEssenceFromHash(nextProps.dataSource, nextProps.hash);
      if (!hashEssence) {
        hashEssence = this.getEssenceFromDataSource(nextProps.dataSource);
        updateViewHash(hashEssence.toHash(), true);
      }

      this.setState({ essence: hashEssence });
    }
  }

  componentWillUpdate(nextProps: CubeViewProps, nextState: CubeViewState): void {
    const { updateViewHash } = this.props;
    const { essence } = this.state;
    if (updateViewHash && !nextState.essence.equals(essence)) {
      updateViewHash(nextState.essence.toHash());
    }
  }

  componentWillUnmount() {
    const { transitionFnSlot } = this.props;

    this.mounted = false;
    window.removeEventListener('resize', this.globalResizeListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
    if (transitionFnSlot) transitionFnSlot.clear();
  }

  getEssenceFromDataSource(dataSource: DataSource): Essence {
    const essence = Essence.fromDataSource(dataSource, { dataSource: dataSource, visualizations: MANIFESTS });
    return essence.multiMeasureMode !== Boolean(localStorage.get('is-multi-measure')) ? essence.toggleMultiMeasureMode() : essence;
  }

  getEssenceFromHash(dataSource: DataSource, hash: string): Essence {
    if (!dataSource || !hash) return null;
    return Essence.fromHash(hash, { dataSource: dataSource, visualizations: MANIFESTS });
  }

  globalKeyDownListener(e: KeyboardEvent) {
    // Shortcuts will go here one day
  }

  globalResizeListener() {
    var { container, visualization } = this.refs;
    var containerDOM = ReactDOM.findDOMNode(container);
    var visualizationDOM = ReactDOM.findDOMNode(visualization);
    if (!containerDOM || !visualizationDOM) return;

    let deviceSize = 'large';
    if (window.innerWidth <= 1250) deviceSize = 'medium';
    if (window.innerWidth <= 1080) deviceSize = 'small';

    this.setState({
      deviceSize,
      menuStage: Stage.fromClientRect(containerDOM.getBoundingClientRect()),
      visualizationStage: Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
    });
  }

  canDrop(e: DragEvent): boolean {
    return Boolean(DragManager.getDragDimension());
  }

  dragEnter(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    this.setState({ dragOver: true });
  }

  dragOver(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
  }

  dragLeave(e: DragEvent) {
    this.setState({ dragOver: false });
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    var dimension = DragManager.getDragDimension();
    if (dimension) {
      this.clicker.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.FairGame);
    }
    this.setState({ dragOver: false });
  }

  openRawDataModal() {
    this.setState({
      showRawDataModal: true
    });
  }

  onRawDataModalClose() {
    this.setState({
      showRawDataModal: false
    });
  }

  renderRawDataModal() {
    const { RawDataModalAsync, showRawDataModal, essence, visualizationStage } = this.state;
    if (!RawDataModalAsync || !showRawDataModal) return null;
    return <RawDataModalAsync
      essence={essence}
      onClose={this.onRawDataModalClose.bind(this)}
    />;
  }

  triggerFilterMenu(dimension: Dimension) {
    if (!dimension) return;
    (this.refs['filterTile'] as FilterTile).filterMenuRequest(dimension);
  }

  triggerSplitMenu(dimension: Dimension) {
    if (!dimension) return;
    (this.refs['splitTile'] as SplitTile).splitMenuRequest(dimension);
  }

  changeTimezone(newTimezone: Timezone): void {
    const { essence } = this.state;
    const newEsssence = essence.changeTimezone(newTimezone);
    this.setState({ essence: newEsssence });
  }

  getStoredLayout(): CubeViewLayout {
    return localStorage.get('cube-view-layout') || {dimensionPanelWidth: 240, pinboardWidth: 240};
  }

  storeLayout(layout: CubeViewLayout) {
    localStorage.set('cube-view-layout', layout);
  }

  onDimensionPanelResize(value: number) {
    let { layout } = this.state;
    layout.dimensionPanelWidth = value;

    this.setState({layout});
    this.storeLayout(layout);
  }

  onPinboardPanelResize(value: number) {
    let { layout } = this.state;
    layout.pinboardWidth = value;

    this.setState({layout});
    this.storeLayout(layout);
  }

  onPanelResizeEnd() {
    this.globalResizeListener();
  }

  render() {
    var clicker = this.clicker;

    var { getUrlPrefix, onNavClick, user, customization } = this.props;
    var { deviceSize, layout, essence, menuStage, visualizationStage, dragOver, updatingMaxTime } = this.state;

    if (!essence) return null;

    var { visualization } = essence;

    var visElement: JSX.Element = null;
    if (essence.visResolve.isReady() && visualizationStage) {
      var visProps: VisualizationProps = {
        clicker,
        essence,
        stage: visualizationStage,
        openRawDataModal: this.openRawDataModal.bind(this),
        registerDownloadableDataset: (dataset: Dataset) => { this.downloadableDataset = dataset; }
      };

      visElement = React.createElement(getVisualizationComponent(visualization), visProps);
    }

    var manualFallback: JSX.Element = null;
    if (essence.visResolve.isManual()) {
      manualFallback = React.createElement(ManualFallback, {
        clicker,
        essence
      });
    }

    var styles = {
      dimensionMeasurePanel: {width: layout.dimensionPanelWidth},
      centerPanel: {left: layout.dimensionPanelWidth, right: layout.pinboardWidth},
      pinboardPanel: {width: layout.pinboardWidth}
    };

    if (deviceSize === 'small') {
      styles = {
        dimensionMeasurePanel: {width: 200},
        centerPanel: {left: 200, right: 200},
        pinboardPanel: {width: 200}
      };
    }

    return <div className='cube-view'>
      <CubeHeaderBar
        clicker={clicker}
        essence={essence}
        user={user}
        onNavClick={onNavClick}
        getUrlPrefix={getUrlPrefix}
        refreshMaxTime={this.refreshMaxTime.bind(this)}
        openRawDataModal={this.openRawDataModal.bind(this)}
        customization={customization}
        getDownloadableDataset={() => this.downloadableDataset}
        changeTimezone={this.changeTimezone.bind(this)}
        timezone={essence.timezone}
        updatingMaxTime={updatingMaxTime}
      />
      <div className="container" ref='container'>
        <DimensionMeasurePanel
          style={styles.dimensionMeasurePanel}
          clicker={clicker}
          essence={essence}
          menuStage={menuStage}
          triggerFilterMenu={this.triggerFilterMenu.bind(this)}
          triggerSplitMenu={this.triggerSplitMenu.bind(this)}
          getUrlPrefix={getUrlPrefix}
        />

        {deviceSize !== 'small' ? <ResizeHandle
          side="left"
          initialValue={layout.dimensionPanelWidth}
          onResize={this.onDimensionPanelResize.bind(this)}
          onResizeEnd={this.onPanelResizeEnd.bind(this)}
          min={MIN_PANEL_WIDTH}
          max={MAX_PANEL_WIDTH}
        /> : null}

        <div className='center-panel' style={styles.centerPanel}>
          <div className='center-top-bar'>
            <div className='filter-split-section'>
              <FilterTile
                ref="filterTile"
                clicker={clicker}
                essence={essence}
                menuStage={visualizationStage}
                getUrlPrefix={getUrlPrefix}
              />
              <SplitTile
                ref="splitTile"
                clicker={clicker}
                essence={essence}
                menuStage={visualizationStage}
                getUrlPrefix={getUrlPrefix}
              />
            </div>
            <VisSelector clicker={clicker} essence={essence}/>
          </div>
          <div
            className='center-main'
            onDragEnter={this.dragEnter.bind(this)}
          >
            <div className='visualization' ref='visualization'>{visElement}</div>
            {manualFallback}
            {dragOver ? <DropIndicator/> : null}
            {dragOver ? <div
              className="drag-mask"
              onDragOver={this.dragOver.bind(this)}
              onDragLeave={this.dragLeave.bind(this)}
              onDragExit={this.dragLeave.bind(this)}
              onDrop={this.drop.bind(this)}
            /> : null}
          </div>
        </div>

        {deviceSize !== 'small' ? <ResizeHandle
          side="right"
          initialValue={layout.pinboardWidth}
          onResize={this.onPinboardPanelResize.bind(this)}
          onResizeEnd={this.onPanelResizeEnd.bind(this)}
          min={MIN_PANEL_WIDTH}
          max={MAX_PANEL_WIDTH}
        /> : null}

        <PinboardPanel
          style={styles.pinboardPanel}
          clicker={clicker}
          essence={essence}
          getUrlPrefix={getUrlPrefix}
        />
      </div>
      {this.renderRawDataModal()}
    </div>;
  }
}

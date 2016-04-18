require('./cube-view.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Expression } from 'plywood';
import { Fn } from "../../../common/utils/general/general";
import { DragManager } from '../../utils/drag-manager/drag-manager';
import { Colors, Clicker, DataSource, Dimension, Essence, Filter, Stage, Manifest, Measure,
  SplitCombine, Splits, VisStrategy, VisualizationProps, User, Customization} from '../../../common/models/index';

import { CubeHeaderBar } from '../cube-header-bar/cube-header-bar';
import { DimensionMeasurePanel } from '../dimension-measure-panel/dimension-measure-panel';
import { FilterTile } from '../filter-tile/filter-tile';
import { SplitTile } from '../split-tile/split-tile';
import { VisSelector } from '../vis-selector/vis-selector';
import { ManualFallback } from '../manual-fallback/manual-fallback';
import { DropIndicator } from '../drop-indicator/drop-indicator';
import { PinboardPanel } from '../pinboard-panel/pinboard-panel';

import { visualizations } from '../../visualizations/index';

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
}

export interface CubeViewState {
  essence?: Essence;
  visualizationStage?: Stage;
  menuStage?: Stage;
  dragOver?: boolean;
}

export class CubeView extends React.Component<CubeViewProps, CubeViewState> {
  static defaultProps = {
    maxFilters: 20,
    maxSplits: 3
  };

  public mounted: boolean;
  private clicker: Clicker;
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      essence: null,
      dragOver: false
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
    DataSource.updateMaxTime(dataSource)
      .then((updatedDataSource) => {
        if (!this.mounted) return;
        this.setState({ essence: essence.updateDataSource(updatedDataSource) });
      });
  }

  componentWillMount() {
    var { hash, dataSource, updateViewHash } = this.props;
    var essence = this.getEssenceFromHash(hash);
    if (!essence) {
      if (!dataSource) throw new Error('must have data source');
      essence = this.getEssenceFromDataSource(dataSource);
      updateViewHash(essence.toHash(), true);
    }
    this.setState({ essence });
  }

  componentDidMount() {
    this.mounted = true;
    DragManager.init();
    window.addEventListener('resize', this.globalResizeListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
    this.globalResizeListener();
  }

  componentWillReceiveProps(nextProps: CubeViewProps) {
    const { hash, dataSource, updateViewHash } = this.props;
    if (!nextProps.dataSource) throw new Error('must have data source');

    if (hash !== nextProps.hash) {
      var hashEssence = this.getEssenceFromHash(nextProps.hash);
      if (!hashEssence) {
        hashEssence = this.getEssenceFromDataSource(nextProps.dataSource);
        updateViewHash(hashEssence.toHash(), true);
      }

      this.setState({ essence: hashEssence });
    } else if (!dataSource.equals(nextProps.dataSource)) {
      var newEssence = this.getEssenceFromDataSource(nextProps.dataSource);
      this.setState({ essence: newEssence });
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
    this.mounted = false;
    window.removeEventListener('resize', this.globalResizeListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  getEssenceFromDataSource(dataSource: DataSource): Essence {
    return Essence.fromDataSource(dataSource, { dataSource: dataSource, visualizations });
  }

  getEssenceFromHash(hash: string): Essence {
    if (!hash) return null;
    var { dataSource } = this.props;
    return Essence.fromHash(hash, { dataSource: dataSource, visualizations });
  }

  globalKeyDownListener(e: KeyboardEvent) {
    // Shortcuts will go here one day
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

  canDrop(e: DragEvent): boolean {
    return Boolean(DragManager.getDragDimension());
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
    var dimension = DragManager.getDragDimension();
    if (dimension) {
      this.clicker.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.FairGame);
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

  render() {
    var clicker = this.clicker;

    var { getUrlPrefix, onNavClick, user, customization } = this.props;
    var { essence, menuStage, visualizationStage, dragOver } = this.state;

    if (!essence) return null;

    var { visualization } = essence;

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

    return <div className='cube-view'>
      <CubeHeaderBar
        clicker={clicker}
        essence={essence}
        user={user}
        onNavClick={onNavClick}
        getUrlPrefix={getUrlPrefix}
        refreshMaxTime={this.refreshMaxTime.bind(this)}
        customization={customization}
      />
      <div className="container" ref='container'>
        <DimensionMeasurePanel
          clicker={clicker}
          essence={essence}
          menuStage={menuStage}
          triggerFilterMenu={this.triggerFilterMenu.bind(this)}
          triggerSplitMenu={this.triggerSplitMenu.bind(this)}
          getUrlPrefix={getUrlPrefix}
        />
        <div className='center-panel'>
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
        <PinboardPanel
          clicker={clicker}
          essence={essence}
          getUrlPrefix={getUrlPrefix}
        />
      </div>
    </div>;
  }
}

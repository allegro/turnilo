require('./link-view.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List } from 'immutable';
import { Expression } from 'plywood';
import { Colors, Clicker, DataSource, Dimension, Essence, Filter, Stage, Manifest, Measure,
  SplitCombine, Splits, VisStrategy, VisualizationProps} from '../../../common/models/index';
// import { ... } from '../../config/constants';

import { LinkHeaderBar } from '../link-header-bar/link-header-bar';
import { DimensionMeasurePanel } from '../dimension-measure-panel/dimension-measure-panel';
import { ManualFallback } from '../manual-fallback/manual-fallback';
import { DropIndicator } from '../drop-indicator/drop-indicator';
import { PinboardPanel } from '../pinboard-panel/pinboard-panel';

import { visualizations } from '../../visualizations/index';

export interface LinkViewProps extends React.Props<any> {
  maxFilters?: number;
  maxSplits?: number;
  hash: string;
  updateHash: Function;
  getUrlPrefix?: Function;
  dataSource: DataSource;
  onNavClick?: Function;
}

export interface LinkViewState {
  linkItem?: LinkItem;
  essence?: Essence;
  visualizationStage?: Stage;
  menuStage?: Stage;
}

export interface LinkItem {
  name: string;
  title: string;
  description: string;
  group?: string;
  dataSource: DataSource;
  essence: Essence;
}

var linkItems: LinkItem[] = null;


export class LinkView extends React.Component<LinkViewProps, LinkViewState> {
  private clicker: Clicker;

  constructor() {
    super();
    this.state = {
      essence: null
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
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { hash, dataSource, updateHash } = this.props;

    linkItems = [
      {
        name: 'test1',
        title: 'Test One',
        description: 'I like testing',
        group: 'Tests',
        dataSource: dataSource,
        essence: Essence.fromJS({
          visualization: 'totals',
          timezone: 'Etc/UTC',
          filter: {
            op: "literal",
            value: true
          },
          pinnedDimensions: ['statusCode'],
          selectedMeasures: ['count', 'countPerIp', 'uniqueIp'],
          splits: []
        }, {
          dataSource,
          visualizations
        })
      }
    ];

    var linkItem = linkItems[0];
    var essence = linkItem.essence;

    //var essence = this.getEssenceFromHash(hash);
    //if (!essence) {
    //  essence = this.getEssenceFromDataSource(dataSource);
    //  updateHash(essence.toHash());
    //}
    this.setState({
      linkItem,
      essence
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
    this.globalResizeListener();
  }

  componentWillReceiveProps(nextProps: LinkViewProps) {
    const { hash, dataSource } = this.props;
    const { essence } = this.state;

    if (hash !== nextProps.hash) {
      var hashEssence = this.getEssenceFromHash(nextProps.hash);
      this.setState({ essence: hashEssence });
    } else if (!dataSource.equals(nextProps.dataSource)) {
      var newEssence = essence.updateDataSource(nextProps.dataSource);
      this.setState({ essence: newEssence });
    }
  }

  componentWillUpdate(nextProps: LinkViewProps, nextState: LinkViewState): void {
    var { essence } = this.state;
    if (!nextState.essence.equals(essence)) {
      this.props.updateHash(nextState.essence.toHash());
    }
  }

  componentWillUnmount() {
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

  render() {
    var clicker = this.clicker;

    var { getUrlPrefix, onNavClick } = this.props;
    var { linkItem, essence, menuStage, visualizationStage } = this.state;

    if (!linkItem) return null;

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

    var title = 'Test Link View';

    return <div className='link-view'>
      <LinkHeaderBar
        title={title}
        onNavClick={onNavClick}
        getUrlPrefix={getUrlPrefix}
      />
      <div className="container" ref='container'>
        <div className="link-panel"/>
        <div className='center-panel'>
          <div className='center-top-bar'>
            {linkItem.title}
          </div>
          <div className='center-main'>
            <div className='visualization' ref='visualization'>{visElement}</div>
            {manualFallback}
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

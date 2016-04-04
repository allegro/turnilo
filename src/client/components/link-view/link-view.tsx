require('./link-view.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Expression } from 'plywood';
import { classNames } from "../../utils/dom/dom";
import { Fn } from "../../../common/utils/general/general";
import { Colors, Clicker, DataSource, Dimension, Essence, Filter, Stage, Manifest, Measure,
  VisualizationProps, LinkViewConfig, LinkItem, User } from '../../../common/models/index';
// import { ... } from '../../config/constants';

import { LinkHeaderBar } from '../link-header-bar/link-header-bar';
import { ManualFallback } from '../manual-fallback/manual-fallback';
import { PinboardPanel } from '../pinboard-panel/pinboard-panel';

export interface LinkViewProps extends React.Props<any> {
  linkViewConfig: LinkViewConfig;
  user?: User;
  hash: string;
  updateViewHash: (newHash: string) => void;
  changeHash: (newHash: string, force?: boolean) => void;
  getUrlPrefix?: () => string;
  onNavClick?: Fn;
}

export interface LinkViewState {
  linkItem?: LinkItem;
  essence?: Essence;
  visualizationStage?: Stage;
  menuStage?: Stage;
}

export class LinkView extends React.Component<LinkViewProps, LinkViewState> {
  private clicker: Clicker;

  constructor() {
    super();
    this.state = {
      linkItem: null,
      essence: null,
      visualizationStage: null,
      menuStage: null
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
      changeColors: (colors: Colors) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changeColors(colors) });
      },
      changePinnedSortMeasure: (measure: Measure) => {
        var { essence } = this.state;
        this.setState({ essence: essence.changePinnedSortMeasure(measure) });
      },
      toggleMeasure: (measure: Measure) => {
        var { essence } = this.state;
        this.setState({ essence: essence.toggleSelectedMeasure(measure) });
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
  }

  componentWillMount() {
    var { hash, linkViewConfig, updateViewHash } = this.props;

    var linkItem = linkViewConfig.findByName(hash);
    if (!linkItem) {
      linkItem = linkViewConfig.defaultLinkItem();
      updateViewHash(linkItem.name);
    }

    this.setState({
      linkItem,
      essence: linkItem.essence
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillReceiveProps(nextProps: LinkViewProps) {
    const { hash, linkViewConfig } = this.props;

    if (hash !== nextProps.hash) {
      var linkItem = linkViewConfig.findByName(hash);
      this.setState({ linkItem });
    }
  }

  componentWillUpdate(nextProps: LinkViewProps, nextState: LinkViewState): void {
    const { updateViewHash } = this.props;
    const { linkItem } = this.state;
    if (updateViewHash && !nextState.linkItem.equals(linkItem)) {
      updateViewHash(nextState.linkItem.name);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.globalResizeListener);
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

  selectLinkItem(linkItem: LinkItem) {
    this.setState({
      linkItem,
      essence: linkItem.essence
    });
  }

  goToCubeView() {
    var { changeHash, getUrlPrefix } = this.props;
    var { essence } = this.state;

    changeHash(`${essence.dataSource.name}/${essence.toHash()}`, true);
  }

  renderLinkPanel() {
    const { linkViewConfig } = this.props;
    const { linkItem } = this.state;

    var groupId = 0;
    var lastGroup: string = null;
    var items: JSX.Element[] = [];
    linkViewConfig.linkItems.forEach(li => {
      // Add a group header if needed
      if (lastGroup !== li.group) {
        items.push(<div
          className="link-group-title"
          key={'group_' + groupId}
        >
          {li.group}
        </div>);
        groupId++;
        lastGroup = li.group;
      }

      items.push(<div
        className={classNames('link-item', { selected: li === linkItem })}
        key={'li_' + li.name}
        onClick={this.selectLinkItem.bind(this, li)}
      >
        {li.title}
      </div>);
    });

    return <div className="link-panel">{items}</div>;
  }

  render() {
    var clicker = this.clicker;

    var { getUrlPrefix, onNavClick, linkViewConfig, user } = this.props;
    var { linkItem, essence, visualizationStage } = this.state;

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

    return <div className='link-view'>
      <LinkHeaderBar
        title={linkViewConfig.title}
        user={user}
        onNavClick={onNavClick}
        onExploreClick={this.goToCubeView.bind(this)}
        getUrlPrefix={getUrlPrefix}
      />
      <div className="container" ref='container'>
        {this.renderLinkPanel()}
        <div className='center-panel'>
          <div className='center-top-bar'>
            <div className='link-title'>{linkItem.title}</div>
            <div className='link-description'>{linkItem.description}</div>
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

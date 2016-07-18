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

require('./link-view.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Expression, $ } from 'plywood';
import { classNames } from '../../utils/dom/dom';
import { Fn } from '../../../common/utils/general/general';
import { Colors, Clicker, Essence, Filter, FilterClause, Stage, Measure,
  VisualizationProps, LinkViewConfig, LinkItem, User, Customization } from '../../../common/models/index';

import * as localStorage from '../../utils/local-storage/local-storage';

import { LinkHeaderBar } from '../../components/link-header-bar/link-header-bar';
import { ManualFallback } from '../../components/manual-fallback/manual-fallback';
import { PinboardPanel } from '../../components/pinboard-panel/pinboard-panel';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Preset } from '../../components/time-filter-menu/time-filter-menu';
import { ResizeHandle } from '../../components/resize-handle/resize-handle';
import { getVisualizationComponent } from '../../visualizations/index';

var $maxTime = $(FilterClause.MAX_TIME_REF_NAME);
var latestPresets: Preset[] = [
  { name: '5M',  selection: $maxTime.timeRange('PT5M', -1) },
  { name: '1H',  selection: $maxTime.timeRange('PT1H', -1) },
  { name: '1D',  selection: $maxTime.timeRange('P1D', -1)  },
  { name: '1W',  selection: $maxTime.timeRange('P1W', -1)  }
];

export interface LinkViewLayout {
  linkPanelWidth: number;
  pinboardWidth: number;
}

export interface LinkViewProps extends React.Props<any> {
  linkViewConfig: LinkViewConfig;
  user?: User;
  hash: string;
  updateViewHash: (newHash: string) => void;
  changeHash: (newHash: string, force?: boolean) => void;
  getUrlPrefix?: () => string;
  onNavClick?: Fn;
  customization?: Customization;
}

export interface LinkViewState {
  linkItem?: LinkItem;
  essence?: Essence;
  visualizationStage?: Stage;
  menuStage?: Stage;
  layout?: LinkViewLayout;
}

const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 400;

export class LinkView extends React.Component<LinkViewProps, LinkViewState> {
  private clicker: Clicker;

  constructor() {
    super();
    this.state = {
      linkItem: null,
      essence: null,
      visualizationStage: null,
      menuStage: null,
      layout: this.getStoredLayout()
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
    const { essence } = this.state;
    var newEssence = linkItem.essence;

    if (essence.getTimeAttribute()) {
      newEssence = newEssence.changeTimeSelection(essence.getTimeSelection());
    }

    this.setState({
      linkItem,
      essence: newEssence
    });
  }

  goToCubeView() {
    var { changeHash, getUrlPrefix } = this.props;
    var { essence } = this.state;

    changeHash(`${essence.dataCube.name}/${essence.toHash()}`, true);
  }

  getStoredLayout(): LinkViewLayout {
    return localStorage.get('link-view-layout') || {linkPanelWidth: 240, pinboardWidth: 240};
  }

  storeLayout(layout: LinkViewLayout) {
    localStorage.set('link-view-layout', layout);
  }

  onLinkPanelResize(value: number) {
    let { layout } = this.state;
    layout.linkPanelWidth = value;

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

  renderPresets() {
    const { essence } = this.state;

    var presetToButton = (preset: Preset) => {
      return {
        isSelected: preset.selection.equals(essence.getTimeSelection()),
        title: preset.name,
        onClick: this.clicker.changeTimeSelection.bind(this, preset.selection),
        key: preset.name
      };
    };
    return <ButtonGroup groupMembers={latestPresets.map(presetToButton)} />;
  }

  renderLinkPanel(style: React.CSSProperties) {
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

    return <div className="link-panel" style={style}>
      <div className="link-container">
        {items}
      </div>
    </div>;
  }

  render() {
    var clicker = this.clicker;

    var { getUrlPrefix, onNavClick, linkViewConfig, user, customization } = this.props;
    var { linkItem, essence, visualizationStage, layout } = this.state;

    if (!linkItem) return null;

    var { visualization } = essence;

    var visElement: JSX.Element = null;
    if (essence.visResolve.isReady() && visualizationStage) {
      var visProps: VisualizationProps = {
        clicker,
        essence,
        stage: visualizationStage
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
      linkMeasurePanel: {width: layout.linkPanelWidth},
      centerPanel: {left: layout.linkPanelWidth, right: layout.pinboardWidth},
      pinboardPanel: {width: layout.pinboardWidth}
    };

    return <div className='link-view'>
      <LinkHeaderBar
        title={linkViewConfig.title}
        user={user}
        onNavClick={onNavClick}
        onExploreClick={this.goToCubeView.bind(this)}
        getUrlPrefix={getUrlPrefix}
        customization={customization}
      />
      <div className="container" ref='container'>
        {this.renderLinkPanel(styles.linkMeasurePanel)}

        <ResizeHandle
          side="left"
          initialValue={layout.linkPanelWidth}
          onResize={this.onLinkPanelResize.bind(this)}
          onResizeEnd={this.onPanelResizeEnd.bind(this)}
          min={MIN_PANEL_WIDTH}
          max={MAX_PANEL_WIDTH}
        />

        <div className='center-panel' style={styles.centerPanel}>
          <div className='center-top-bar'>
            <div className='link-title'>{linkItem.title}</div>
            <div className='link-description'>{linkItem.description}</div>
            <div className="right-align">
              {this.renderPresets()}
            </div>
          </div>
          <div className='center-main'>
            <div className='visualization' ref='visualization'>{visElement}</div>
            {manualFallback}
          </div>
        </div>

        <ResizeHandle
          side="right"
          initialValue={layout.pinboardWidth}
          onResize={this.onPinboardPanelResize.bind(this)}
          onResizeEnd={this.onPanelResizeEnd.bind(this)}
          min={MIN_PANEL_WIDTH}
          max={MAX_PANEL_WIDTH}
        />

        <PinboardPanel
          style={styles.pinboardPanel}
          clicker={clicker}
          essence={essence}
          getUrlPrefix={getUrlPrefix}
        />
      </div>
    </div>;
  }
}

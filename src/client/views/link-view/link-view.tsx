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
import { Expression, $, find } from 'plywood';
import { Timezone } from 'chronoshift';
import { classNames } from '../../utils/dom/dom';
import { Fn } from '../../../common/utils/general/general';
import { Colors, Clicker, Essence, Timekeeper, Filter, FilterClause, Stage, Measure,
  VisualizationProps, Collection, CollectionTile, User, Customization } from '../../../common/models/index';

import * as localStorage from '../../utils/local-storage/local-storage';
import { STRINGS } from "../../config/constants";

import { ManualFallback, PinboardPanel, Preset, ResizeHandle, Dropdown } from '../../components/index';

import { getVisualizationComponent } from '../../visualizations/index';

import { LinkHeaderBar } from './link-header-bar/link-header-bar';

var $maxTime = $(FilterClause.MAX_TIME_REF_NAME);
var latestPresets: Preset[] = [
  { name: STRINGS.last5Minutes,  selection: $maxTime.timeRange('PT5M', -1) },
  { name: STRINGS.lastHour,  selection: $maxTime.timeRange('PT1H', -1) },
  { name: STRINGS.lastDay,  selection: $maxTime.timeRange('P1D', -1)  },
  { name: STRINGS.lastWeek,  selection: $maxTime.timeRange('P1W', -1)  }
];

export interface LinkViewLayout {
  linkPanelWidth: number;
  pinboardWidth: number;
}

export interface LinkViewProps extends React.Props<any> {
  timekeeper: Timekeeper;
  collection: Collection;
  user?: User;
  hash: string;
  updateViewHash: (newHash: string) => void;
  changeHash: (newHash: string, force?: boolean) => void;
  getUrlPrefix?: () => string;
  onNavClick?: Fn;
  customization?: Customization;
  stateful: boolean;
}

export interface LinkViewState {
  linkTile?: CollectionTile;
  essence?: Essence;
  visualizationStage?: Stage;
  menuStage?: Stage;
  layout?: LinkViewLayout;
  deviceSize?: string;
}

const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 400;

export class LinkView extends React.Component<LinkViewProps, LinkViewState> {
  private clicker: Clicker;

  constructor() {
    super();
    this.state = {
      linkTile: null,
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
    var { hash, collection, updateViewHash } = this.props;

    var linkTile = collection.findByName(hash);
    if (!linkTile) {
      linkTile = collection.getDefaultTile();
      updateViewHash(linkTile.name);
    }

    this.setState({
      linkTile,
      essence: linkTile.essence
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillReceiveProps(nextProps: LinkViewProps) {
    const { hash, collection } = this.props;

    if (hash !== nextProps.hash) {
      var linkTile = collection.findByName(hash);
      this.setState({ linkTile });
    }
  }

  componentWillUpdate(nextProps: LinkViewProps, nextState: LinkViewState): void {
    const { updateViewHash } = this.props;
    const { linkTile } = this.state;
    if (updateViewHash && !nextState.linkTile.equals(linkTile)) {
      updateViewHash(nextState.linkTile.name);
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

    let deviceSize = 'large';
    if (window.innerWidth <= 1250) deviceSize = 'medium';
    if (window.innerWidth <= 1080) deviceSize = 'small';

    this.setState({
      deviceSize,
      menuStage: Stage.fromClientRect(containerDOM.getBoundingClientRect()),
      visualizationStage: Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
    });
  }

  selectLinkItem(linkTile: CollectionTile) {
    const { essence } = this.state;
    var newEssence = linkTile.essence;

    if (essence.getTimeAttribute()) {
      newEssence = newEssence.changeTimeSelection(essence.getTimeSelection());
    }

    this.setState({
      linkTile,
      essence: newEssence
    });
  }

  goToCubeView() {
    var { changeHash, getUrlPrefix } = this.props;
    var { essence } = this.state;

    changeHash(`${essence.dataCube.name}/${essence.toHash()}`, true);
  }

  changeTimezone(newTimezone: Timezone): void {
    const { essence } = this.state;
    const newEssence = essence.changeTimezone(newTimezone);
    this.setState({ essence: newEssence });
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

  selectPreset(p: Preset) {
    this.clicker.changeTimeSelection(p.selection);
  }

  renderPresets() {
    const { essence } = this.state;
    const PresetDropdown = Dropdown.specialize<Preset>();

    var selected = find(latestPresets, p => p.selection.equals(essence.getTimeSelection()));
    return <PresetDropdown
      items={latestPresets}
      selectedItem={selected}
      equal={(a, b) => {
          if (a === b) return true;
          if (!a !== !b) return false;
          return a.selection === b.selection;
        }
      }
      renderItem={(p) => p ? p.name : ""}
      onSelect={this.selectPreset.bind(this)}
    />;
  }

  renderLinkPanel(style: React.CSSProperties) {
    const { collection } = this.props;
    const { linkTile } = this.state;

    var groupId = 0;
    var lastGroup: string = null;
    var items: JSX.Element[] = [];
    collection.tiles.forEach(li => {
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
        className={classNames('link-item', { selected: li === linkTile })}
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

    var { timekeeper, getUrlPrefix, onNavClick, collection, user, customization, stateful } = this.props;
    var { deviceSize, linkTile, essence, visualizationStage, layout } = this.state;

    if (!linkTile) return null;

    var { visualization } = essence;

    var visElement: JSX.Element = null;
    if (essence.visResolve.isReady() && visualizationStage) {
      var visProps: VisualizationProps = {
        clicker,
        timekeeper,
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

    if (deviceSize === 'small') {
      styles = {
        linkMeasurePanel: {width: 200},
        centerPanel: {left: 200, right: 200},
        pinboardPanel: {width: 200}
      };
    }

    return <div className='link-view'>
      <LinkHeaderBar
        title={collection.title}
        user={user}
        onNavClick={onNavClick}
        onExploreClick={this.goToCubeView.bind(this)}
        getUrlPrefix={getUrlPrefix}
        customization={customization}
        changeTimezone={this.changeTimezone.bind(this)}
        timezone={essence.timezone}
        stateful={stateful}
      />
      <div className="container" ref='container'>
        {this.renderLinkPanel(styles.linkMeasurePanel)}

        {deviceSize !== 'small' ?  <ResizeHandle
          side="left"
          initialValue={layout.linkPanelWidth}
          onResize={this.onLinkPanelResize.bind(this)}
          onResizeEnd={this.onPanelResizeEnd.bind(this)}
          min={MIN_PANEL_WIDTH}
          max={MAX_PANEL_WIDTH}
        /> : null}

        <div className='center-panel' style={styles.centerPanel}>
          <div className='center-top-bar'>
            <div className='link-title'>{linkTile.title}</div>
            <div className='link-description'>{linkTile.description}</div>
            <div className="right-align">
              {this.renderPresets()}
            </div>
          </div>
          <div className='center-main'>
            <div className='visualization' ref='visualization'>{visElement}</div>
            {manualFallback}
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
          timekeeper={timekeeper}
          getUrlPrefix={getUrlPrefix}
        />
      </div>
    </div>;
  }
}

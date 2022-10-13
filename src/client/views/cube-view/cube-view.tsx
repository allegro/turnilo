/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Timezone } from "chronoshift";
import memoizeOne from "memoize-one";
import { $ } from "plywood";
import React from "react";
import { CSSTransition } from "react-transition-group";
import { ClientAppSettings } from "../../../common/models/app-settings/app-settings";
import { Clicker } from "../../../common/models/clicker/clicker";
import { ClientCustomization } from "../../../common/models/customization/customization";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { Device, DeviceSize } from "../../../common/models/device/device";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Filter } from "../../../common/models/filter/filter";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Split } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { Stage } from "../../../common/models/stage/stage";
import { TimeShift } from "../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import {
  Visualization,
  VisualizationManifest
} from "../../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../../../common/models/visualization-settings/visualization-settings";
import { Binary, Ternary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { maxTimeQuery } from "../../../common/utils/query/max-time-query";
import { datesEqual } from "../../../common/utils/time/time";
import { DimensionMeasurePanel } from "../../components/dimension-measure-panel/dimension-measure-panel";
import { GlobalEventListener } from "../../components/global-event-listener/global-event-listener";
import { PinboardPanel } from "../../components/pinboard-panel/pinboard-panel";
import { Direction, DragHandle, ResizeHandle } from "../../components/resize-handle/resize-handle";
import { SideDrawer } from "../../components/side-drawer/side-drawer";
import { SvgIcon } from "../../components/svg-icon/svg-icon";
import { VisSkeleton } from "../../components/vis-skeleton/vis-skeleton";
import { DruidQueryModal } from "../../modals/druid-query-modal/druid-query-modal";
import { RawDataModal } from "../../modals/raw-data-modal/raw-data-modal";
import { UrlShortenerModal } from "../../modals/url-shortener-modal/url-shortener-modal";
import { ViewDefinitionModal } from "../../modals/view-definition-modal/view-definition-modal";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import * as localStorage from "../../utils/local-storage/local-storage";
import { getVisualizationComponent } from "../../visualizations";
import { CubeContext, CubeContextValue } from "./cube-context";
import { CubeHeaderBar } from "./cube-header-bar/cube-header-bar";
import "./cube-view.scss";
import { DownloadableDatasetProvider } from "./downloadable-dataset-context";
import { PartialTilesProvider } from "./partial-tiles-provider";

const ToggleArrow: React.FunctionComponent<{ right: boolean }> = ({ right }) =>
  right
    ? <SvgIcon svg={require("../../icons/full-caret-small-right.svg")}/>
    : <SvgIcon svg={require("../../icons/full-caret-small-left.svg")}/>;

export interface CubeViewLayout {
  factPanel: {
    width: number;
    hidden?: boolean;
  };
  pinboard: {
    width: number;
    hidden?: boolean;
  };
}

const defaultLayout: CubeViewLayout = {
  factPanel: { width: 240 },
  pinboard: { width: 240 }
};

export interface CubeViewProps {
  initTimekeeper?: Timekeeper;
  maxFilters?: number;
  hash: string;
  changeCubeAndEssence: Ternary<ClientDataCube, Essence, boolean, void>;
  urlForCubeAndEssence: Binary<ClientDataCube, Essence, string>;
  getEssenceFromHash: Binary<string, ClientDataCube, Essence>;
  dataCube: ClientDataCube;
  dataCubes: ClientDataCube[];
  openAboutModal: Fn;
  customization?: ClientCustomization;
  appSettings: ClientAppSettings;
}

export interface CubeViewState {
  essence?: Essence;
  timekeeper?: Timekeeper;
  menuStage?: Stage;
  dragOver?: boolean;
  showSideBar?: boolean;
  showRawDataModal?: boolean;
  showViewDefinitionModal?: boolean;
  showDruidQueryModal?: boolean;
  urlShortenerModalProps?: { url: string, title: string };
  layout?: CubeViewLayout;
  deviceSize?: DeviceSize;
  updatingMaxTime?: boolean;
  lastRefreshRequestTimestamp: number;
}

const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 400;

const CONTROL_PANEL_HEIGHT = 115; // redefined in .center-top-bar in cube-view.scss

export class CubeView extends React.Component<CubeViewProps, CubeViewState> {
  static defaultProps: Partial<CubeViewProps> = { maxFilters: 20 };

  private static canDrop(): boolean {
    return DragManager.draggingDimension() !== null;
  }

  public mounted: boolean;
  private readonly clicker: Clicker;
  private container = React.createRef<HTMLDivElement>();
  private centerPanel = React.createRef<HTMLDivElement>();

  constructor(props: CubeViewProps) {
    super(props);

    this.state = {
      essence: null,
      dragOver: false,
      layout: this.getStoredLayout(),
      lastRefreshRequestTimestamp: 0,
      updatingMaxTime: false
    };

    this.clicker = {
      changeFilter: (filter: Filter) => {
        this.setState(state => {
          let { essence } = state;
          essence = essence.changeFilter(filter);
          return { ...state, essence };
        });
      },
      changeComparisonShift: (timeShift: TimeShift) => {
        this.setState(state =>
          ({ ...state, essence: state.essence.changeComparisonShift(timeShift) }));
      },
      changeSplits: (splits: Splits, strategy: VisStrategy) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changeSplits(splits, strategy) });
      },
      changeSplit: (split: Split, strategy: VisStrategy) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changeSplit(split, strategy) });
      },
      addSplit: (split: Split, strategy: VisStrategy) => {
        const { essence } = this.state;
        this.setState({ essence: essence.addSplit(split, strategy) });
      },
      removeSplit: (split: Split, strategy: VisStrategy) => {
        const { essence } = this.state;
        this.setState({ essence: essence.removeSplit(split, strategy) });
      },
      changeSeriesList: (seriesList: SeriesList) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changeSeriesList(seriesList) });
      },
      addSeries: (series: Series) => {
        const { essence } = this.state;
        this.setState({ essence: essence.addSeries(series) });
      },
      removeSeries: (series: Series) => {
        const { essence } = this.state;
        this.setState({ essence: essence.removeSeries(series) });
      },
      changeVisualization: (visualization: VisualizationManifest, settings: VisualizationSettings) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changeVisualization(visualization, settings) });
      },
      pin: (dimension: Dimension) => {
        const { essence } = this.state;
        this.setState({ essence: essence.pin(dimension) });
      },
      unpin: (dimension: Dimension) => {
        const { essence } = this.state;
        this.setState({ essence: essence.unpin(dimension) });
      },
      changePinnedSortSeries: (series: Series) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changePinnedSortSeries(series) });
      }
    };
  }

  refreshMaxTime = () => {
    const { essence, timekeeper } = this.state;
    const { dataCube: { name, executor, timeAttribute, refreshRule } } = essence;
    this.setState({ updatingMaxTime: true });

    maxTimeQuery($(timeAttribute), executor)
      .then(maxTime => {
        if (!this.mounted) return;
        const timeName = name;
        const isBatchCube = !refreshRule.isRealtime();
        const isCubeUpToDate = datesEqual(maxTime, timekeeper.getTime(timeName));
        if (isBatchCube && isCubeUpToDate) {
          this.setState({ updatingMaxTime: false });
          return;
        }
        this.setState({
          timekeeper: timekeeper.updateTime(timeName, maxTime),
          updatingMaxTime: false,
          lastRefreshRequestTimestamp: (new Date()).getTime()
        });
      });
  };

  UNSAFE_componentWillMount() {
    const { hash, dataCube, initTimekeeper } = this.props;
    if (!dataCube) {
      throw new Error("Data cube is required.");
    }

    this.setState({
      timekeeper: initTimekeeper || Timekeeper.EMPTY
    });
    this.updateEssenceFromHashOrDataCube(hash, dataCube);
  }

  componentDidMount() {
    this.mounted = true;
    DragManager.init();
    this.globalResizeListener();
  }

  UNSAFE_componentWillReceiveProps(nextProps: CubeViewProps) {
    const { hash, dataCube } = this.props;
    if (!nextProps.dataCube) {
      throw new Error("Data cube is required.");
    }

    if (dataCube.name !== nextProps.dataCube.name || hash !== nextProps.hash) {
      this.updateEssenceFromHashOrDataCube(nextProps.hash, nextProps.dataCube);
    }
  }

  UNSAFE_componentWillUpdate(nextProps: CubeViewProps, nextState: CubeViewState): void {
    const { changeCubeAndEssence, dataCube } = this.props;
    const { essence } = this.state;
    if (!nextState.essence.equals(essence)) {
      changeCubeAndEssence(dataCube, nextState.essence, false);
    }
  }

  componentDidUpdate(prevProps: CubeViewProps, {
    layout: {
      pinboard: prevPinboard,
      factPanel: prevFactPanel
    }
  }: CubeViewState) {
    const { layout: { pinboard, factPanel } } = this.state;
    if (pinboard.hidden !== prevPinboard.hidden || factPanel.hidden !== prevFactPanel.hidden) {
      this.globalResizeListener();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  updateEssenceFromHashOrDataCube(hash: string, dataCube: ClientDataCube) {
    let essence: Essence;
    try {
      essence = this.getEssenceFromHash(hash, dataCube);
    } catch (e) {
      const { changeCubeAndEssence } = this.props;
      essence = this.getEssenceFromDataCube(dataCube);
      changeCubeAndEssence(dataCube, essence, true);
    }
    this.setState({ essence });
  }

  getEssenceFromDataCube(dataCube: ClientDataCube): Essence {
    return Essence.fromDataCube(dataCube);
  }

  getEssenceFromHash(hash: string, dataCube: ClientDataCube): Essence {
    if (!dataCube) {
      throw new Error("Data cube is required.");
    }

    if (!hash) {
      throw new Error("Hash is required.");
    }

    const { getEssenceFromHash } = this.props;
    return getEssenceFromHash(hash, dataCube);
  }

  globalResizeListener = () => {
    this.setState({
      deviceSize: Device.getSize(),
      menuStage: this.container.current && Stage.fromClientRect(this.container.current.getBoundingClientRect())
    });
  };

  private isSmallDevice(): boolean {
    return this.state.deviceSize === DeviceSize.SMALL;
  }

  dragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!CubeView.canDrop()) return;
    e.preventDefault();
    this.setState({ dragOver: true });
  };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!CubeView.canDrop()) return;
    e.preventDefault();
  };

  dragLeave = () => {
    this.setState({ dragOver: false });
  };

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!CubeView.canDrop()) return;
    e.preventDefault();
    const dimension = DragManager.draggingDimension();
    if (dimension) {
      this.clicker.changeSplit(Split.fromDimension(dimension), VisStrategy.FairGame);
    }
    this.setState({ dragOver: false });
  };

  openRawDataModal = () => {
    this.setState({
      showRawDataModal: true
    });
  };

  onRawDataModalClose = () => {
    this.setState({
      showRawDataModal: false
    });
  };

  renderRawDataModal() {
    const { showRawDataModal, essence, timekeeper } = this.state;
    const { customization } = this.props;
    if (!showRawDataModal) return null;

    return <RawDataModal
      essence={essence}
      timekeeper={timekeeper}
      locale={customization.locale}
      onClose={this.onRawDataModalClose}
    />;
  }

  openViewDefinitionModal = () => {
    this.setState({
      showViewDefinitionModal: true
    });
  };

  onViewDefinitionModalClose = () => {
    this.setState({
      showViewDefinitionModal: false
    });
  };

  renderViewDefinitionModal() {
    const { showViewDefinitionModal, essence } = this.state;
    if (!showViewDefinitionModal) return null;

    return <ViewDefinitionModal
      onClose={this.onViewDefinitionModalClose}
      essence={essence}
    />;
  }

  openDruidQueryModal = () => {
    this.setState({
      showDruidQueryModal: true
    });
  };

  closeDruidQueryModal = () => {
    this.setState({
      showDruidQueryModal: false
    });
  };

  renderDruidQueryModal() {
    const { showDruidQueryModal, essence, timekeeper } = this.state;
    if (!showDruidQueryModal) return null;
    return <DruidQueryModal
      timekeeper={timekeeper}
      essence={essence}
      onClose={this.closeDruidQueryModal}/>;
  }

  openUrlShortenerModal = (url: string, title: string) => {
    this.setState({
      urlShortenerModalProps: { url, title }
    });
  };

  closeUrlShortenerModal = () => {
    this.setState({
      urlShortenerModalProps: null
    });
  };

  renderUrlShortenerModal() {
    const { urlShortenerModalProps } = this.state;
    if (!urlShortenerModalProps) return null;
    return <UrlShortenerModal
      title={urlShortenerModalProps.title}
      url={urlShortenerModalProps.url}
      onClose={this.closeUrlShortenerModal}/>;
  }

  changeTimezone = (newTimezone: Timezone) => {
    const { essence } = this.state;
    const newEssence = essence.changeTimezone(newTimezone);
    this.setState({ essence: newEssence });
  };

  getStoredLayout(): CubeViewLayout {
    return localStorage.get("cube-view-layout-v2") || defaultLayout;
  }

  storeLayout(layout: CubeViewLayout) {
    localStorage.set("cube-view-layout-v2", layout);
  }

  private updateLayout(layout: CubeViewLayout) {
    this.setState({ layout });
    this.storeLayout(layout);
  }

  toggleFactPanel = () => {
    const { layout: { factPanel }, layout } = this.state;
    this.updateLayout({
      ...layout,
      factPanel: {
        ...factPanel,
        hidden: !factPanel.hidden
      }
    });
  };

  togglePinboard = () => {
    const { layout: { pinboard }, layout } = this.state;
    this.updateLayout({
      ...layout,
      pinboard: {
        ...pinboard,
        hidden: !pinboard.hidden
      }
    });
  };

  onFactPanelResize = (width: number) => {
    const { layout: { factPanel }, layout } = this.state;
    this.updateLayout({
      ...layout,
      factPanel: {
        ...factPanel,
        width
      }
    });
  };

  onPinboardPanelResize = (width: number) => {
    const { layout: { pinboard }, layout } = this.state;
    this.updateLayout({
      ...layout,
      pinboard: {
        ...pinboard,
        width
      }
    });
  };

  onPanelResizeEnd = () => {
    this.globalResizeListener();
  };

  // TODO: Refactor via https://github.com/allegro/turnilo/issues/799
  private chartStage(): Stage | null {
    const { menuStage } = this.state;
    const { centerPanel: { left, right } } = this.calculateStyles();
    if (!menuStage) return null;
    return menuStage.within({
      left,
      right,
      top: CONTROL_PANEL_HEIGHT
    });
  }

  private getCubeContext(): CubeContextValue {
    const { essence } = this.state;
    /*
     React determine context value change using value reference.
     Because we're creating new object, reference would be different despite same values inside,
     hence memoization. More info: https://reactjs.org/docs/context.html#caveats
    */
    return this.constructContext(essence, this.clicker);
  }

  private urlForEssence = (essence: Essence): string => {
    const { dataCube, urlForCubeAndEssence } = this.props;
    return urlForCubeAndEssence(dataCube, essence);
  }

  private constructContext = memoizeOne(
    (essence: Essence, clicker: Clicker) =>
      ({ essence, clicker }),
    ([nextEssence, nextClicker]: [Essence, Clicker], [prevEssence, prevClicker]: [Essence, Clicker]) =>
      nextEssence.equals(prevEssence) && nextClicker === prevClicker);

  private getVisualization = memoizeOne((name: Visualization) => React.lazy(getVisualizationComponent(name)));

  render() {
    const clicker = this.clicker;

    const { customization } = this.props;
    const {
      layout,
      essence,
      timekeeper,
      menuStage,
      dragOver,
      updatingMaxTime,
      lastRefreshRequestTimestamp
    } = this.state;

    if (!essence) return null;

    const styles = this.calculateStyles();

    const headerBar = <CubeHeaderBar
      clicker={clicker}
      essence={essence}
      timekeeper={timekeeper}
      onNavClick={this.sideDrawerOpen}
      urlForEssence={this.urlForEssence}
      refreshMaxTime={this.refreshMaxTime}
      openRawDataModal={this.openRawDataModal}
      openViewDefinitionModal={this.openViewDefinitionModal}
      openUrlShortenerModal={this.openUrlShortenerModal}
      openDruidQueryModal={this.openDruidQueryModal}
      customization={customization}
      changeTimezone={this.changeTimezone}
      updatingMaxTime={updatingMaxTime}
    />;

    const Visualization = this.getVisualization(essence.visualization.name);
    const chartStage = this.chartStage();

    return <CubeContext.Provider value={this.getCubeContext()}>
      <DownloadableDatasetProvider>
        <div className="cube-view">
          <GlobalEventListener resize={this.globalResizeListener}/>
          {headerBar}
          <div className="container" ref={this.container}>
            <PartialTilesProvider>{({ series, filter, addFilter, addSeries, removeTile }) => <React.Fragment>
              {!layout.factPanel.hidden && <DimensionMeasurePanel
                style={styles.dimensionMeasurePanel}
                clicker={clicker}
                essence={essence}
                menuStage={menuStage}
                addPartialFilter={dimension =>
                  addFilter(dimension, DragPosition.insertAt(essence.filter.length()))}
                addPartialSeries={series =>
                  addSeries(series, DragPosition.insertAt(essence.series.count()))}
              />}
              {!this.isSmallDevice() && !layout.factPanel.hidden && <ResizeHandle
                direction={Direction.LEFT}
                value={layout.factPanel.width}
                onResize={this.onFactPanelResize}
                onResizeEnd={this.onPanelResizeEnd}
                min={MIN_PANEL_WIDTH}
                max={MAX_PANEL_WIDTH}
              >
                <DragHandle/>
              </ResizeHandle>}

              <div className="center-panel" style={styles.centerPanel} ref={this.centerPanel}>
                <div className="dimension-panel-toggle"
                     onClick={this.toggleFactPanel}>
                  <ToggleArrow right={layout.factPanel.hidden}/>
                </div>
                <React.Suspense
                  fallback={<VisSkeleton essence={essence}
                                         stage={chartStage}
                                         timekeeper={timekeeper}
                                         customization={customization}/>}>
                  <Visualization
                    essence={essence}
                    clicker={clicker}
                    timekeeper={timekeeper}
                    stage={chartStage}
                    customization={customization}
                    addSeries={addSeries}
                    addFilter={addFilter}
                    lastRefreshRequestTimestamp={lastRefreshRequestTimestamp}
                    partialFilter={filter}
                    partialSeries={series}
                    removeTile={removeTile}
                    dragEnter={this.dragEnter}
                    dragOver={this.dragOver}
                    isDraggedOver={dragOver}
                    dragLeave={this.dragLeave}
                    drop={this.drop}
                  />
                </React.Suspense>
                <div className="pinboard-toggle"
                     onClick={this.togglePinboard}>
                  <ToggleArrow right={!layout.pinboard.hidden}/>
                </div>
              </div>

              {!this.isSmallDevice() && !layout.pinboard.hidden && <ResizeHandle
                direction={Direction.RIGHT}
                value={layout.pinboard.width}
                onResize={this.onPinboardPanelResize}
                onResizeEnd={this.onPanelResizeEnd}
                min={MIN_PANEL_WIDTH}
                max={MAX_PANEL_WIDTH}
              >
                <DragHandle/>
              </ResizeHandle>}
              {!layout.pinboard.hidden && <PinboardPanel
                style={styles.pinboardPanel}
                clicker={clicker}
                essence={essence}
                timekeeper={timekeeper}
                refreshRequestTimestamp={lastRefreshRequestTimestamp}/>}
            </React.Fragment>}</PartialTilesProvider>
          </div>
          {this.renderDruidQueryModal()}
          {this.renderRawDataModal()}
          {this.renderViewDefinitionModal()}
          {this.renderUrlShortenerModal()}
        </div>
        {this.renderSideDrawer()}
      </DownloadableDatasetProvider>
    </CubeContext.Provider>;
  }

  sideDrawerOpen = () => {
    this.setState({ showSideBar: true });
  };

  sideDrawerClose = () => {
    this.setState({ showSideBar: false });
  };

  renderSideDrawer() {
    const { dataCubes, changeCubeAndEssence, openAboutModal, appSettings } = this.props;
    const { showSideBar, essence } = this.state;
    const { customization } = appSettings;
    const transitionTimeout = { enter: 500, exit: 300 };
    return <CSSTransition
      in={showSideBar}
      classNames="side-drawer"
      mountOnEnter={true}
      unmountOnExit={true}
      timeout={transitionTimeout}
    >
      <SideDrawer
        key="drawer"
        essence={essence}
        dataCubes={dataCubes}
        onOpenAbout={openAboutModal}
        onClose={this.sideDrawerClose}
        customization={customization}
        changeDataCubeAndEssence={changeCubeAndEssence}
      />
    </CSSTransition>;
  }

  private calculateStyles() {
    const { layout } = this.state;
    const isDimensionPanelHidden = layout.factPanel.hidden;
    const isPinboardHidden = layout.pinboard.hidden;
    if (this.isSmallDevice()) {
      const dimensionsWidth = isDimensionPanelHidden ? 0 : 200;
      const pinboardWidth = isPinboardHidden ? 0 : 200;
      return {
        dimensionMeasurePanel: { width: dimensionsWidth },
        centerPanel: { left: dimensionsWidth, right: pinboardWidth },
        pinboardPanel: { width: pinboardWidth }
      };
    }
    const nonSmallLayoutPadding = 10;
    return {
      dimensionMeasurePanel: {
        width: isDimensionPanelHidden ? 0 : layout.factPanel.width
      },
      centerPanel: {
        left: isDimensionPanelHidden ? nonSmallLayoutPadding : layout.factPanel.width,
        right: isPinboardHidden ? nonSmallLayoutPadding : layout.pinboard.width
      },
      pinboardPanel: {
        width: isPinboardHidden ? 0 : layout.pinboard.width
      }
    };
  }
}

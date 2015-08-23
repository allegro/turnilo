'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { Timezone } from 'chronology';
import { $, Expression, Executor, InAction, ChainExpression, LiteralExpression, find } from 'plywood';
import { Stage, Essence, DataSource, Filter, SplitCombine, Dimension, Measure, Clicker } from '../../models/index';
import { FilterTile } from '../filter-tile/filter-tile';
import { SplitTile } from '../split-tile/split-tile';
import { DimensionListTile } from '../dimension-list-tile/dimension-list-tile';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { MenuActionBar } from '../menu-action-bar/menu-action-bar';

interface FilterSplitPanelProps {
  clicker: Clicker;
  essence: Essence;
}

interface FilterSplitPanelState {
  selectedSection?: string;
  selectedDimension?: Dimension;
  anchor?: number;
  stage?: Stage;
  trigger?: Element;
}

export class FilterSplitPanel extends React.Component<FilterSplitPanelProps, FilterSplitPanelState> {
  constructor() {
    super();
    this.state = {
      selectedSection: null,
      selectedDimension: null,
      anchor: null,
      stage: null
    };
    this.globalResizeListener = this.globalResizeListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.globalResizeListener);
  }

  globalResizeListener() {
    var rect = React.findDOMNode(this).getBoundingClientRect();
    this.setState({
      stage: new Stage({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      })
    });
  }

  componentWillReceiveProps(nextProps: FilterSplitPanelProps) {

  }

  menuOpen(section: string, target: Element, dimension: Dimension) {
    var currentTrigger = this.state.trigger;
    if (currentTrigger === target) {
      this.menuClose();
      return;
    }
    var targetRect = target.getBoundingClientRect();
    var containerStage = this.state.stage;
    this.setState({
      selectedSection: section,
      selectedDimension: dimension,
      anchor: targetRect.top - containerStage.y + Math.floor(targetRect.height / 2),
      trigger: target
    });
  }

  menuClose() {
    this.setState({
      selectedSection: null,
      selectedDimension: null,
      anchor: null,
      trigger: null
    });
  }

  renderMenu(): React.ReactElement<any> {
    var { essence, clicker } = this.props;
    var { selectedSection, selectedDimension, anchor, stage, trigger } = this.state;
    if (!selectedDimension) return null;

    return JSX(`
      <BubbleMenu
        anchor={anchor}
        parentStage={stage}
        trigger={trigger}
        onClose={this.menuClose.bind(this)}
      >
        <div>Hello World</div>
        <MenuActionBar clicker={clicker} essence={essence} dimension={selectedDimension}/>
      </BubbleMenu>
    `);
  }

  render() {
    var { essence, clicker } = this.props;
    var { selectedSection, selectedDimension } = this.state;
    var { dataSource, filter, timezone, splits } = essence;

    return JSX(`
      <div className="filter-split-panel">
        <FilterTile
          clicker={clicker}
          essence={essence}
          selectedDimension={selectedSection === 'filter' ? selectedDimension : null}
          triggerMenuOpen={this.menuOpen.bind(this, 'filter')}
        />
        <SplitTile
          clicker={clicker}
          essence={essence}
          selectedDimension={selectedSection === 'split' ? selectedDimension : null}
          triggerMenuOpen={this.menuOpen.bind(this, 'split')}
        />
        <DimensionListTile
          clicker={clicker}
          essence={essence}
          selectedDimension={selectedSection === 'dimension' ? selectedDimension : null}
          triggerMenuOpen={this.menuOpen.bind(this, 'dimension')}
        />
        {this.renderMenu()}
      </div>
    `);
  }
}

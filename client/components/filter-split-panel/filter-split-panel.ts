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
import { MenuHeader } from '../menu-header/menu-header';
import { MenuTable } from '../menu-table/menu-table';
import { MenuActionBar } from '../menu-action-bar/menu-action-bar';

interface FilterSplitPanelProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface FilterSplitPanelState {
  selectedSection?: string;
  selectedDimension?: Dimension;
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
  }

  menuOpen(section: string, target: Element, dimension: Dimension) {
    var currentTrigger = this.state.trigger;
    if (currentTrigger === target) {
      this.menuClose();
      console.log('cur close');
      return;
    }
    console.log('do open');
    var targetRect = target.getBoundingClientRect();
    this.setState({
      selectedSection: section,
      selectedDimension: dimension,
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
    var { essence, clicker, menuStage } = this.props;
    var { selectedSection, selectedDimension, trigger } = this.state;
    if (!selectedDimension) return null;
    var onClose = this.menuClose.bind(this);

    if (selectedSection === 'dimension') {
      return JSX(`
        <BubbleMenu containerStage={menuStage} openOn={trigger} onClose={onClose}>
          <MenuHeader dimension={selectedDimension}/>
          <MenuTable
            essence={essence}
            dimension={selectedDimension}
            showSearch={true}
            showCheckboxes={true}
          />
          <MenuActionBar clicker={clicker} essence={essence} dimension={selectedDimension} onClose={onClose}/>
        </BubbleMenu>
      `);
    } else {

    }
  }

  render() {
    var { essence, clicker } = this.props;
    var { selectedSection, selectedDimension } = this.state;

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

'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { Timezone, Duration } from 'chronoshift';
import { $, Expression, Executor, Dataset, TimeBucketAction } from 'plywood';
import { Stage, Clicker, Essence, DataSource, SplitCombine, Filter, Dimension, Measure, TimePreset } from '../../models/index';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { MenuHeader } from '../menu-header/menu-header';

const GRANULARITIES = ['PT1M', 'PT1H', 'P1D', 'P7D'];

interface SplitMenuProps {
  clicker: Clicker;
  essence: Essence;
  direction: string;
  containerStage: Stage;
  openOn: Element;
  dimension: Dimension;
  split: SplitCombine;
  onClose: Function;
}

interface SplitMenuState {
}

export class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    // this.state = {};

  }

  onGranClick(gran: string): void {
    var { clicker, essence, split, onClose } = this.props;
    var bucketAction = split.bucketAction;
    if (bucketAction instanceof TimeBucketAction) {
      var newSplit = split.changeBucketAction(new TimeBucketAction({
        timezone: bucketAction.timezone,
        duration: Duration.fromJS(gran)
      }));
      clicker.changeSplits(essence.splits.replace(split, newSplit));
    }
    onClose();
  }

  render() {
    var { essence, clicker, direction, containerStage, openOn, dimension, split, onClose } = this.props;
    if (!dimension) return null;

    var menuSize = Stage.fromSize(250, 200);

    var granCont: React.DOMElement<any> = null;
    if (split.bucketAction instanceof TimeBucketAction) {
      var buttons = GRANULARITIES.map(g => {
        return JSX(`<li key={g} onClick={this.onGranClick.bind(this, g)}>{g}</li>`);
      });

      granCont = JSX(`<ul className="button-group">{buttons}</ul>`);
    }

    return JSX(`
      <BubbleMenu className="split-menu" direction={direction} containerStage={containerStage} stage={menuSize} openOn={openOn} onClose={onClose}>
        <div className="menu-cont">
          {granCont || 'Split controls coming soon.'}
        </div>
      </BubbleMenu>
    `);
  }
}

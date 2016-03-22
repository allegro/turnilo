require('./hiluk-menu.css');

import * as React from 'react';
import { Stage, Clicker, Essence } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { BubbleMenu } from '../bubble-menu/bubble-menu';


export interface HilukMenuProps extends React.Props<any> {
  //clicker: Clicker;
  openOn: Element;
  onClose: Function;
}

export interface HilukMenuState {
}

export class HilukMenu extends React.Component<HilukMenuProps, HilukMenuState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { openOn, onClose } = this.props;

    var stage = Stage.fromSize(200, 200);
    return <BubbleMenu
      className="hiluk-menu"
      direction="down"
      stage={stage}
      openOn={openOn}
      onClose={onClose}
    >
      <ul className="bubble-list">
        <li
          className="copy-url clipboard"
          data-clipboard-text="URL"
          onClick={onClose as any}
        >{STRINGS.copyUrl}</li>
        <li
          className="copy-static-url clipboard"
          data-clipboard-text="STATIC_URL"
          onClick={onClose as any}
        >{STRINGS.copyStaticUrl}</li>
      </ul>
    </BubbleMenu>;
  }
}

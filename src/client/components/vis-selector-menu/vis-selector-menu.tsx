require('./vis-selector-menu.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Fn } from '../../../common/utils/general/general';
import { SvgIcon } from '../svg-icon/svg-icon';
import { isInside, escapeKey, classNames } from '../../utils/dom/dom';
import { Clicker, Essence, Manifest } from '../../../common/models/index';

export interface VisSelectorMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  openOn: Element;
  onClose: Fn;
}

export interface VisSelectorMenuState {
}

export class VisSelectorMenu extends React.Component<VisSelectorMenuProps, VisSelectorMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.globalMouseDownListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    var { onClose, openOn } = this.props;
    var myElement = ReactDOM.findDOMNode(this);
    if (!myElement) return;
    var target = e.target as Element;

    if (isInside(target, myElement) || isInside(target, openOn)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose } = this.props;
    onClose();
  }

  onVisSelect(v: Manifest) {
    var { clicker } = this.props;
    clicker.changeVisualization(v);
    this.setState({
      menuOpen: false
    });
  }

  renderVisItem(v: Manifest): JSX.Element {
    var { essence } = this.props;
    var { visualization } = essence;

    return <div
      className={classNames('vis-item', (v.name === visualization.name ? 'selected' : 'not-selected'))}
      key={v.name}
      onClick={this.onVisSelect.bind(this, v)}
    >
      <SvgIcon svg={require('../../icons/vis-' + v.name + '.svg')}/>
      <div className="vis-title">{v.title}</div>
    </div>;
  }

  render() {
    var { essence } = this.props;
    var { visualizations } = essence;

    var visItems: JSX.Element[] = null;
    if (visualizations) {
      visItems = visualizations.map(v => {
        return this.renderVisItem(v);
      });
    }

    return <div className="vis-selector-menu">
      {visItems}
    </div>;
  }
}

'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { isInside, escapeKey } from '../../utils/dom/dom';
import { Clicker, Essence, Measure, Manifest } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface VisSelectorMenuProps {
  clicker: Clicker;
  essence: Essence;
  openOn: Element;
  onClose: Function;
}

export interface VisSelectorMenuState {
}

export class VisSelectorMenu extends React.Component<VisSelectorMenuProps, VisSelectorMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    // this.state = {};
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
    var myElement = React.findDOMNode(this);
    if (!myElement) return;
    var target = <Element>e.target;

    if (isInside(target, myElement) || isInside(target, openOn)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose } = this.props;
    onClose();
  }

  onVisSelect(v: Manifest) {
    var { clicker, essence } = this.props;
    clicker.selectVisualization(v);
    this.setState({
      menuOpen: false
    });
  }

  renderVisItem(v: Manifest, onClick: Function): React.DOMElement<any> {
    var { essence } = this.props;
    var { visualizations } = essence;

    var state: string;
    if (v.id === essence.visualization.id) {
      state = 'selected';
    } else {
      state = v.handleCircumstance(essence.dataSource, essence.splits).toString();
    }

    return JSX(`
      <div
        className={'vis-item ' + state}
        key={v.id}
        onClick={onClick.bind(this, v)}
      >
        <Icon name={'vis-' + v.id}/>
        <div className="vis-title">{v.title}</div>
      </div>
    `);
  }

  render() {
    var { essence } = this.props;
    var { visualizations } = essence;

    var visItems: Array<React.DOMElement<any>> = null;
    if (visualizations) {
      visItems = visualizations.toArray().map(v => {
        return this.renderVisItem(v, this.onVisSelect);
      });
    }

    return JSX(`
      <div className="vis-selector-menu">
        {visItems}
      </div>
    `);
  }
}

'use strict';
require('./vis-selector-menu.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { isInside, escapeKey } from '../../utils/dom/dom';
import { Clicker, Essence, Measure, Manifest } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface VisSelectorMenuProps extends React.Props<any> {
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
    var { clicker, essence } = this.props;
    clicker.changeVisualization(v);
    this.setState({
      menuOpen: false
    });
  }

  renderVisItem(v: Manifest, onClick: Function): JSX.Element {
    var { essence } = this.props;
    var { visualization } = essence;

    var state: string;
    if (v.id === visualization.id) {
      state = 'selected';
    } else {
      state = 'not-selected'; // v.handleCircumstance(essence.dataSource, essence.splits, essence.colors, false).toString();
    }

    return <div
      className={'vis-item ' + state}
      key={v.id}
      onClick={onClick.bind(this, v)}
    >
      <SvgIcon svg={require('../../icons/vis-' + v.id + '.svg')}/>
      <div className="vis-title">{v.title}</div>
    </div>;
  }

  render() {
    var { essence } = this.props;
    var { visualizations } = essence;

    var visItems: Array<JSX.Element> = null;
    if (visualizations) {
      visItems = visualizations.toArray().map(v => {
        return this.renderVisItem(v, this.onVisSelect);
      });
    }

    return <div className="vis-selector-menu">
      {visItems}
    </div>;
  }
}

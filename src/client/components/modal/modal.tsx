require('./modal.css');

import * as React from 'react';
import { Fn } from "../../../common/utils/general/general";
import { isInside, escapeKey, uniqueId, classNames } from '../../utils/dom/dom';
import { BodyPortal } from '../body-portal/body-portal';
import { SvgIcon } from '../svg-icon/svg-icon';
import { GoldenCenter } from '../golden-center/golden-center';

export interface ModalProps extends React.Props<any> {
  className?: string;
  id?: string;
  title?: string;
  mandatory?: boolean;
  onClose: Fn;
}

export interface ModalState {
  id?: string;
}

export class Modal extends React.Component<ModalProps, ModalState> {

  constructor() {
    super();
    this.state = {
      id: null
    };
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { id } = this.props;

    this.setState({
      id: id || uniqueId('modal-')
    });
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
    var { onClose, mandatory } = this.props;
    if (mandatory) return;

    var { id } = this.state;
    // can not use ReactDOM.findDOMNode(this) because portal?
    var myElement = document.getElementById(id) as Element;
    if (!myElement) return;
    var target = e.target as Element;

    if (isInside(target, myElement)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose, mandatory } = this.props;
    if (mandatory) return;
    onClose();
  }

  render() {
    var { className, title, children, onClose } = this.props;
    var { id } = this.state;

    var titleElement: JSX.Element = null;
    if (typeof title === 'string') {
      titleElement = <div className="modal-title">
        <div className="text">{title}</div>
        <div className="close" onClick={onClose}>
          <SvgIcon svg={require('../../icons/full-remove.svg')}/>
        </div>
      </div>;
    }

    return <BodyPortal fullSize={true}>
      <div className={classNames('modal', className)}>
        <div className="backdrop"></div>
        <GoldenCenter>
          <div className="modal-window" id={id}>
            {titleElement}
            {children}
          </div>
        </GoldenCenter>
      </div>
    </BodyPortal>;
  }
}

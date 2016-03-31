require('./about-modal.css');

import * as React from 'react';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Modal } from '../modal/modal';

export interface AboutModalProps extends React.Props<any> {
  onClose: Function;
}

export interface AboutModalState {
}

export class AboutModal extends React.Component<AboutModalProps, AboutModalState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { onClose } = this.props;

    return <Modal
      className="about-modal"
      title="About"
      onClose={onClose}
    >
      <p>
        For feedback and support please visit the <a href="https://groups.google.com/forum/#!forum/imply-user-group">Imply User Group</a>
      </p>
      <p>
        For bug reports please create an issue on <a href="https://github.com/implydata/pivot/issues">GitHub</a>
      </p>
      <p>
        <a href="https://github.com/implydata/pivot">Pivot</a> is provided under the <a href="https://github.com/implydata/pivot/blob/master/LICENSE">Apache 2.0</a> license.
      </p>
    </Modal>;
  }
}

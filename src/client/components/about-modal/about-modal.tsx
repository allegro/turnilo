require('./about-modal.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { STRINGS } from '../../config/constants';
import { Modal } from '../modal/modal';
import { Button } from '../button/button';

export interface AboutModalProps extends React.Props<any> {
  onClose: Fn;
}

export interface AboutModalState {
}

export class AboutModal extends React.Component<AboutModalProps, AboutModalState> {

  constructor() {
    super();
  }

  render() {
    const { onClose } = this.props;

    return <Modal
      className="about-modal"
      title="About Pivot"
      onClose={onClose}
    >
      <p>
        For feedback and support please visit
        the <a href="https://groups.google.com/forum/#!forum/imply-user-group" target='_blank'>Imply User Group</a>.
      </p>
      <p>
        For bug reports please create an issue on <a href="https://github.com/implydata/pivot/issues" target='_blank'>GitHub</a>.
      </p>
      <p>
        <a href="https://github.com/implydata/pivot" target='_blank'>Pivot</a> is open source under
        the <a href="https://github.com/implydata/pivot/blob/master/LICENSE" target='_blank'>Apache 2.0</a> license.
        It is being built and maintained with great care by <a href="http://imply.io/" target='_blank'>imply.io</a>.
      </p>
      <div className="button-bar">
        <Button type="primary" onClick={onClose} title={STRINGS.close}/>
      </div>
    </Modal>;
  }
}

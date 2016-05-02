import { BodyPortal } from './body-portal';
import * as sinon from 'sinon';

export class BodyPortalMock {
  static disableBodyPortal() {
    beforeEach(() => {
      sinon.stub(BodyPortal.prototype, 'render', function() { return this.props.children; });
      sinon.stub(BodyPortal.prototype, 'teleport');
    });

    afterEach(() => {
      (BodyPortal.prototype.render as Sinon.SinonStub).restore();
      (BodyPortal.prototype.teleport as Sinon.SinonStub).restore();
    });
  }
}

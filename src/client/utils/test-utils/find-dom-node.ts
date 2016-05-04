import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';
import { BodyPortal } from '../../components/body-portal/body-portal';

export function findDOMNode(element: __React.Component<any, any>): Element {
  var portal = TestUtils.scryRenderedComponentsWithType(element, BodyPortal)[0];

  return portal ? portal.target.childNodes[0] : ReactDOM.findDOMNode(element);
}

import { $ } from 'plywood';
import { DataSourceMock } from "../data-source/data-source.mock";
import { LinkItemMock } from "../link-item/link-item.mock";
import { LinkViewConfig, LinkViewConfigJS, LinkViewConfigContext } from './link-view-config';

export class LinkViewConfigMock {
  public static testOneOnlyJS(): LinkViewConfigJS {
    return {
      title: 'The Links Will Rise Again!',
      linkItems: [
        LinkItemMock.testOneJS()
      ]
    };
  }

  public static testOneTwoJS(): LinkViewConfigJS {
    return {
      title: 'The Links Will Be Reloaded!',
      linkItems: [
        LinkItemMock.testOneJS(),
        LinkItemMock.testTwoJS()
      ]
    };
  }

  static getContext(): LinkViewConfigContext {
    return LinkItemMock.getContext();
  }

  static testOneOnly() {
    return LinkViewConfig.fromJS(LinkViewConfigMock.testOneOnlyJS(), LinkViewConfigMock.getContext());
  }

  static testOneTwo() {
    return LinkViewConfig.fromJS(LinkViewConfigMock.testOneTwoJS(), LinkViewConfigMock.getContext());
  }
}

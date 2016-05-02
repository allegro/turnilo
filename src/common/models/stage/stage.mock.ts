import { Stage, StageJS } from './stage';

export class StageMock {
  public static get DEFAULT_A_JS(): StageJS {
    return {
      x: 10,
      y: 5,
      height: 2,
      width: 2
    };
  }

  public static get DEFAULT_B_JS(): StageJS {
    return {
      x: 10,
      y: 500,
      height: 2,
      width: 2
    };
  }

  public static get DEFAULT_C_JS(): StageJS {
    return {
      x: 10,
      y: 5,
      height: 3,
      width: 2
    };
  }

  static defaultA() {
    return Stage.fromJS(StageMock.DEFAULT_A_JS);
  }

  static defaultB() {
    return Stage.fromJS(StageMock.DEFAULT_B_JS);
  }
}

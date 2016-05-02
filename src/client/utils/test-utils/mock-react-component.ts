import * as React from 'react';

export function mockReactComponent(_class: any) {
  let prototype = _class.prototype;
  let toUndo: (() => void)[] = [];

  if (prototype.hasOwnProperty('componentDidMount') === true) {
    let oldComponentDidMount = prototype.componentDidMount;
    toUndo.push(() => {
      prototype.componentDidMount = oldComponentDidMount;
    });
    prototype.componentDidMount = () => {};
  }

  if (prototype.hasOwnProperty('render') === true) {
    let oldRender = prototype.render;
    toUndo.push(() => {
      prototype.render = oldRender;
    });

    prototype.render = (): any => { return null; };
  }

  _class.restore = function() {
    toUndo.map((fn: any) => fn());
    delete this.restore;
  };
}

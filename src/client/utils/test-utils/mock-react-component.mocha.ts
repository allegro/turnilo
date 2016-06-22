import { expect } from 'chai';
import { mockReactComponent } from './mock-react-component';

describe('mockReactComponent', () => {
  class TestClass {
    render() {
      throw new Error('Hey, render is supposed to be stubbed !');
    }

    componentDidMount() {
      throw new Error('Hey, componentDidMount is supposed to be stubbed !');
    }
  }

  it('should stub render and componentDidMount', () => {
    mockReactComponent(TestClass);

    let myInstance = new TestClass();

    expect(myInstance.render()).to.equal(null);
    expect(myInstance.componentDidMount()).to.equal(undefined);

  });

  // This is not ideal since it relies on the previous test to have ran
  // However it's important to demonstrate the mocking is class-based and not
  // scope based.
  it('should restore render and componentDidMount', () => {
    (TestClass as any).restore();

    let myInstance = new TestClass();

    expect(() => myInstance.render())
      .to.throw('Hey, render is supposed to be stubbed !');

    expect(() => myInstance.componentDidMount())
      .to.throw('Hey, componentDidMount is supposed to be stubbed !');
  });
});

require('./immutable-input.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { classNames } from '../../utils/dom/dom';

import { firstUp } from '../../utils/string/string';

export interface ImmutableInputProps extends React.Props<any> {
  instance: any;
  path: string;
  focusOnStartUp?: boolean;
  onChange?: (newInstance: any, valid: boolean, path?: string) => void;
  onInvalid?: (invalidValue: string) => void;
  validator?: RegExp;
}

export interface ImmutableInputState {
  newInstance?: any;
  invalidValue?: string;
}

export class ImmutableInput extends React.Component<ImmutableInputProps, ImmutableInputState> {
  private focusAlreadyGiven =  false;

  constructor() {
    super();
    this.state = {};
  }

  initFromProps(props: ImmutableInputProps) {
    if (!props.instance || !props.path) return;

    this.setState({
      newInstance: props.instance,
      invalidValue: undefined
    });
  }

  componentWillReceiveProps(nextProps: ImmutableInputProps) {
    if (nextProps.instance !== this.state.newInstance) {
      this.initFromProps(nextProps);
    }
  }

  componentDidUpdate() {
    this.maybeFocus();
  }

  componentDidMount() {
    this.initFromProps(this.props);

    this.maybeFocus();
  }

  maybeFocus() {
    if (!this.focusAlreadyGiven && this.props.focusOnStartUp && this.refs['me']) {
      (ReactDOM.findDOMNode(this.refs['me']) as any).focus();
      this.focusAlreadyGiven = true;
    }
  }

  changeImmutable(instance: any, path: string, newValue: any): any {
    var bits = path.split('.');
    var lastObject = newValue;
    var currentObject: any;

    var getLastObject = () => {
      let o: any = instance;

      for (let i = 0; i < bits.length; i++) {
        o = o[bits[i]];
      }

      return o;
    };

    while (bits.length) {
      let bit = bits.pop();

      currentObject = getLastObject();

      let fnName = `change${firstUp(bit)}`;

      if (currentObject[fnName]) {
        lastObject = currentObject[fnName](lastObject);
      } else {
        throw new Error('Unknow function : ' + fnName);
      }
    }

    return lastObject;
  }

  onChange(event: KeyboardEvent) {
    const { path, onChange, instance, validator, onInvalid } = this.props;

    var newValue: any = (event.target as HTMLInputElement).value;

    var newInstance: any;
    var invalidValue: string;

    if (validator && !validator.test(newValue)) {
      newInstance = this.props.instance;
      invalidValue = newValue;

      if (onInvalid) onInvalid(newValue);

    } else {
      newInstance = this.changeImmutable(instance, path, newValue);
    }

    this.setState({newInstance, invalidValue});

    if (onChange) onChange(newInstance, invalidValue === undefined, path);
  }

  getValue(instance: any, path: string): string {
    var value = instance;
    var bits = path.split('.');
    var bit: string;
    while (bit = bits.shift()) value = value[bit];

    return value as string;
  }

  render() {
    const { path } = this.props;
    const { newInstance, invalidValue } = this.state;

    if (!path || !newInstance) return null;

    const value = this.getValue(newInstance, path);

    return <input
      className={classNames('immutable-input', {error: invalidValue !== undefined})}
      ref='me'
      type="text"
      value={invalidValue !== undefined ? invalidValue : value}
      onChange={this.onChange.bind(this)}
    />;
  }
}

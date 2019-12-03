/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { ImmutableUtils } from "../../../common/utils/immutable-utils/immutable-utils";
import { classNames } from "../../utils/dom/dom";
import { ChangeFn } from "../../utils/immutable-form-delegate/immutable-form-delegate";
import "./immutable-input.scss";

export type InputType = "text" | "textarea";

export interface ImmutableInputProps {
  instance: any;
  className?: string;
  path: string;
  focusOnStartUp?: boolean;
  onChange?: ChangeFn;
  onInvalid?: (invalidString: string) => void;
  validator?: RegExp | ((str: string) => boolean);
  stringToValue?: (str: string) => any;
  valueToString?: (value: any) => string;
  type?: InputType;
}

export interface ImmutableInputState {
  myInstance?: any;
  invalidString?: string;
  validString?: string;
}

export class ImmutableInput extends React.Component<ImmutableInputProps, ImmutableInputState> {
  static defaultProps: Partial<ImmutableInputProps> = {
    type: "text",
    stringToValue: String,
    valueToString: (value: any) => value ? String(value) : ""
  };

  static simpleGenerator(instance: any, changeFn: ChangeFn) {
    return (name: string, validator = /^.+$/, focusOnStartUp = false) => {
      return <ImmutableInput
        key={name}
        instance={instance}
        path={name}
        className={name}
        onChange={changeFn}
        focusOnStartUp={focusOnStartUp}
        validator={validator}
      />;
    };
  }

  private focusAlreadyGiven = false;
  private input = React.createRef<HTMLInputElement>();

  constructor(props: ImmutableInputProps) {
    super(props);
    this.state = {};
  }

  initFromProps(props: ImmutableInputProps) {
    if (!props.instance || !props.path) return;

    let validString: string;

    if (this.state.validString === undefined) {
      validString = props.valueToString(ImmutableUtils.getProperty(props.instance, props.path));
    } else {
      const currentCanonical = props.valueToString(props.stringToValue(this.state.validString));
      const possibleCanonical = props.valueToString(ImmutableUtils.getProperty(props.instance, props.path));

      validString = currentCanonical === possibleCanonical ? this.state.validString : possibleCanonical;
    }

    this.setState({
      myInstance: props.instance,
      invalidString: undefined,
      validString
    });
  }

  reset(callback?: () => void) {
    this.setState(
      {
        invalidString: undefined,
        validString: undefined
      },
      callback
    );
  }

  componentWillReceiveProps(nextProps: ImmutableInputProps) {
    if (nextProps.instance === undefined) {
      this.reset(() => this.initFromProps(nextProps));
      return;
    }

    if (this.state.invalidString === undefined && nextProps.instance !== this.state.myInstance) {
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
    if (!this.focusAlreadyGiven && this.props.focusOnStartUp && this.input.current) {
      this.input.current.select();
      this.focusAlreadyGiven = true;
    }
  }

  isValueValid(value: string): boolean {
    const { validator } = this.props;

    if (!validator) return true;

    if (validator instanceof RegExp) {
      return validator.test(value);
    }

    if (validator instanceof Function) {
      return !!validator(value);
    }

    return true;
  }

  update(newString: string) {
    const { path, onChange, instance, validator, onInvalid, stringToValue } = this.props;

    let myInstance: any;
    let invalidString: string;
    let validString: string;
    let error = "";
    let newValue;

    try {
      newValue = stringToValue ? stringToValue(newString) : newString;

      if (validator && !this.isValueValid(newString)) {
        myInstance = instance;
        invalidString = newString;
        if (onInvalid) onInvalid(newValue);

      } else {
        myInstance = ImmutableUtils.setProperty(instance, path, newValue);
        validString = newString;
      }
    } catch (e) {
      myInstance = instance;
      invalidString = newString;
      error = (e as Error).message;
      if (onInvalid) onInvalid(newValue);
    }

    this.setState({ myInstance, invalidString, validString }, () => {
      if (onChange) onChange(myInstance, invalidString === undefined, path, error);
    });
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => this.update(event.target.value);

  render() {
    const { path, type, className } = this.props;
    const { myInstance, invalidString, validString } = this.state;
    const isInvalid = invalidString !== undefined;

    if (!path || !myInstance) return null;

    if (type === "textarea") {
      return <textarea
        className={classNames("immutable-input", className, { error: isInvalid })}
        ref="me"
        value={(isInvalid ? invalidString : validString) || ""}
        onChange={this.onChange}
      />;
    }

    return <input
      className={classNames("immutable-input", className, { error: isInvalid })}
      ref={this.input}
      type="text"
      value={(isInvalid ? invalidString : validString) || ""}
      onChange={this.onChange}
    />;
  }
}

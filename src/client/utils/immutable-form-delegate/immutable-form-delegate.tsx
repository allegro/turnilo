/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as React from 'react';

export interface FormItem {
  change: (propName: string, propValue: any) => FormItem;
}

export interface ChangeFn {
  (myInstance: any, valid: boolean, path?: string, error?: string): void;
}

export interface ImmutableFormState<T> {
  newInstance?: T;
  canSave?: boolean;
  errors?: any;
}

export class ImmutableFormDelegate<T> {

  private form: React.Component<any, ImmutableFormState<T>>;

  constructor(form: React.Component<any, ImmutableFormState<T>>) {
    this.form = form;

    this.form.state = {
      canSave: false,
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
    this.updateErrors = this.updateErrors.bind(this);
  }

  private setState(state: ImmutableFormState<T>, callback?: () => void) {
    return this.form.setState.call(this.form, state, callback);
  }

  updateErrors(path: string, isValid: boolean, error: string): {errors: any, canSave: boolean} {
    var { errors } = this.form.state;

    errors[path] = isValid ? false : error;

    var canSave = true;
    for (let key in errors) canSave = canSave && (errors[key] === false);

    return {errors, canSave};
  }

  onChange(newItem: any, isValid: boolean, path: string, error: string) {
    var { errors, canSave } = this.updateErrors(path, isValid, error);

    if (isValid) {
      this.setState({
        errors,
        newInstance: newItem,
        canSave
      });
    } else {
      this.setState({
        errors,
        canSave: false
      });
    }
  }
}

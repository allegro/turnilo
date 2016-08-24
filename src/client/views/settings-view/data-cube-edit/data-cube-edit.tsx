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

require('./data-cube-edit.css');

import * as React from 'react';
import { List } from 'immutable';
import { AttributeInfo } from 'plywood';
import { Fn } from '../../../../common/utils/general/general';
import { classNames } from '../../../utils/dom/dom';

import { STRINGS } from '../../../config/constants';

import { generateUniqueName } from '../../../../common/utils/string/string';

import { Duration, Timezone } from 'chronoshift';

import { DATA_CUBES_STRATEGIES_LABELS } from '../../../config/constants';

import { SvgIcon, FormLabel, Button, SimpleList, ImmutableInput, ImmutableList, ImmutableDropdown } from '../../../components/index';
import { DimensionModal, MeasureModal } from '../../../modals/index';
import { AppSettings, ListItem, Cluster, DataCube, Dimension, DimensionJS, Measure, MeasureJS } from '../../../../common/models/index';

import { DATA_CUBE as LABELS } from '../../../../common/models/labels';

import { ImmutableFormDelegate, ImmutableFormState } from '../../../utils/immutable-form-delegate/immutable-form-delegate';


export interface DataCubeEditProps extends React.Props<any> {
  isNewDataCube?: boolean;
  dataCube?: DataCube;
  clusters?: Cluster[];
  tab?: string;
  onSave: (newDataCube: DataCube) => void;
  onCancel?: () => void;
}

export interface DataCubeEditState extends ImmutableFormState<DataCube> {
  tab?: any;
}

export interface Tab {
  label: string;
  value: string;
  render: () => JSX.Element;
}


export class DataCubeEdit extends React.Component<DataCubeEditProps, DataCubeEditState> {
  private tabs: Tab[] = [
    {label: 'General', value: 'general', render: this.renderGeneral},
    {label: 'Attributes', value: 'attributes', render: this.renderAttributes},
    {label: 'Dimensions', value: 'dimensions', render: this.renderDimensions},
    {label: 'Measures', value: 'measures', render: this.renderMeasures}
  ];

  private delegate: ImmutableFormDelegate<DataCube>;

  constructor() {
    super();

    this.delegate = new ImmutableFormDelegate<DataCube>(this);
  }

  componentWillReceiveProps(nextProps: DataCubeEditProps) {
    if (nextProps.dataCube) {
      this.initFromProps(nextProps);
    }
  }

  componentDidMount() {
    if (this.props.dataCube) this.initFromProps(this.props);
  }

  initFromProps(props: DataCubeEditProps) {
    this.setState({
      newInstance: new DataCube(props.dataCube.valueOf()),
      canSave: true,
      errors: {},
      tab: props.isNewDataCube ? this.tabs[0] : this.tabs.filter((tab) => tab.value === props.tab)[0]
    });
  }

  selectTab(tab: Tab) {
    if (this.props.isNewDataCube) {
      this.setState({tab});
    } else {
      var hash = window.location.hash.split('/');
      hash.splice(-1);
      window.location.hash = hash.join('/') + '/' + tab;
    }
  }

  renderTabs(activeTab: Tab): JSX.Element[] {
    return this.tabs.map((tab) => {
      return <button
        className={classNames({active: activeTab.value === tab.value})}
        key={tab.value}
        onClick={this.selectTab.bind(this, tab)}
      >{tab.label}</button>;
    });
  }

  cancel() {
    const { isNewDataCube } = this.props;

    if (isNewDataCube) {
      this.props.onCancel();
      return;
    }

    // Setting newInstance to undefined resets the inputs
    this.setState({newInstance: undefined}, () => this.initFromProps(this.props));
  }

  save() {
    if (this.props.onSave) this.props.onSave(this.state.newInstance);
  }

  goBack() {
    const { dataCube, tab } = this.props;
    var hash = window.location.hash;
    window.location.hash = hash.replace(`/${dataCube.name}/${tab}`, '');
  }

  getIntrospectionStrategies(): ListItem[] {
    const labels = DATA_CUBES_STRATEGIES_LABELS as any;

    return [{
      label: `Default (${labels[DataCube.DEFAULT_INTROSPECTION]})`,
      value: undefined
    }].concat(DataCube.INTROSPECTION_VALUES.map((value) => {
      return {value, label: labels[value]};
    }));
  }

  renderGeneral(): JSX.Element {
    const { clusters } = this.props;
    const { newInstance, errors } = this.state;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors);
    var makeTextInput = ImmutableInput.simpleGenerator(newInstance, this.delegate.onChange);
    var makeDropDownInput = ImmutableDropdown.simpleGenerator(newInstance, this.delegate.onChange);

    var possibleClusters = [
      { value: 'native', label: 'Load a file and serve it natively' }
    ].concat(clusters.map((cluster) => {
      return { value: cluster.name, label: cluster.name };
    }));

    return <form className="general vertical">
      {makeLabel('title')}
      {makeTextInput('title', /.*/, true)}

      {makeLabel('description')}
      {makeTextInput('description')}

      {makeLabel('clusterName')}
      {makeDropDownInput('clusterName', possibleClusters)}

      {makeLabel('source')}
      {makeTextInput('source')}

      {makeLabel('defaultTimezone')}
      <ImmutableInput
        instance={newInstance}
        path={'defaultTimezone'}
        onChange={this.delegate.onChange}

        valueToString={(value: Timezone) => value ? value.toJS() : undefined}
        stringToValue={(str: string) => str ? Timezone.fromJS(str) : undefined}
      />

    </form>;
  }

  renderAttributes(): JSX.Element {
    const { newInstance, errors } = this.state;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors);

    return <form className="general vertical">

      {makeLabel('attributeOverrides')}
      <ImmutableInput
        instance={newInstance}
        path={'attributeOverrides'}
        onChange={this.delegate.onChange}

        valueToString={(value: AttributeInfo[]) => value ? JSON.stringify(AttributeInfo.toJSs(value), null, 2) : undefined}
        stringToValue={(str: string) => str ? AttributeInfo.fromJSs(JSON.parse(str)) : undefined}
        type="textarea"
      />

    </form>;
  }

  renderDimensions(): JSX.Element {
    const { newInstance } = this.state;

    const onChange = (newDimensions: List<Dimension>) => {
      const newCube = newInstance.changeDimensions(newDimensions);
      this.setState({
        newInstance: newCube
      });
    };

    const getModal = (item: Dimension) => <DimensionModal dimension={item}/>;

    const getNewItem = () => Dimension.fromJS({
      name: generateUniqueName('d', name => !newInstance.dimensions.find(m => m.name === name)),
      title: 'New dimension'
    });

    const getRows = (items: List<Dimension>) => items.toArray().map((dimension) => {
      return {
        title: dimension.title,
        description: dimension.expression.toString(),
        icon: `dim-${dimension.kind}`
      };
    });

    const DimensionsList = ImmutableList.specialize<Dimension>();

    return <DimensionsList
      label="Dimensions"
      items={newInstance.dimensions}
      onChange={onChange.bind(this)}
      getModal={getModal}
      getNewItem={getNewItem}
      getRows={getRows}
    />;
  }

  renderMeasures(): JSX.Element {
    var { newInstance } = this.state;

    const onChange = (newMeasures: List<Measure>) => {

      var { defaultSortMeasure } = newInstance;

      if (defaultSortMeasure) {
        if (!newMeasures.find((measure) => measure.name === defaultSortMeasure)) {
          newInstance = newInstance.changeDefaultSortMeasure(newMeasures.get(0).name);
        }
      }

      const newCube = newInstance.changeMeasures(newMeasures);
      this.setState({
        newInstance: newCube
      });
    };

    const getModal = (item: Measure) => <MeasureModal measure={item}/>;

    const getNewItem = () => Measure.fromJS({
      name: generateUniqueName('m', name => !newInstance.measures.find(m => m.name === name)),
      title: 'New measure'
    });

    const getRows = (items: List<Measure>) => items.toArray().map((measure) => {
      return {
        title: measure.title,
        description: measure.expression.toString(),
        icon: `measure`
      };
    });

    const MeasuresList = ImmutableList.specialize<Measure>();

    return <MeasuresList
      label="Measures"
      items={newInstance.measures}
      onChange={onChange.bind(this)}
      getModal={getModal}
      getNewItem={getNewItem}
      getRows={getRows}
    />;
  }

  renderButtons(): JSX.Element {
    const { dataCube, isNewDataCube } = this.props;
    const { canSave, newInstance } = this.state;
    const hasChanged = !dataCube.equals(newInstance);

    const cancelButton = <Button
      className="cancel"
      title={isNewDataCube ?  "Cancel" : "Revert changes"}
      type="secondary"
      onClick={this.cancel.bind(this)}
    />;

    const saveButton = <Button
      className={classNames("save", {disabled: !canSave || (!isNewDataCube && !hasChanged)})}
      title={isNewDataCube ? "Create cube" : "Save"}
      type="primary"
      onClick={this.save.bind(this)}
    />;

    if (!isNewDataCube && !hasChanged) {
      return <div className="button-group">
        {saveButton}
      </div>;
    }

    return <div className="button-group">
      {cancelButton}
      {saveButton}
    </div>;
  }

  getTitle(): string {
    const { isNewDataCube } = this.props;
    const { newInstance } = this.state;

    const lastBit = newInstance.title ? `: ${newInstance.title}` : '';

    return (isNewDataCube ? STRINGS.createDataCube : STRINGS.editDataCube) + lastBit;
  }

  render() {
    const { dataCube, isNewDataCube } = this.props;
    const { tab, newInstance } = this.state;

    if (!newInstance || !tab || !dataCube) return null;

    return <div className="data-cube-edit">
      <div className="title-bar">
        {isNewDataCube
          ? null
          : <Button
              className="button back"
              type="secondary"
              svg={require('../../../icons/full-back.svg')}
              onClick={this.goBack.bind(this)}
            />
        }
        <div className="title">{this.getTitle()}</div>
        {this.renderButtons()}
      </div>
      <div className="content">
        <div className="tabs">
          {this.renderTabs(tab)}
        </div>
        <div className="tab-content">
          {tab.render.bind(this)()}
        </div>
      </div>

    </div>;
  }
}

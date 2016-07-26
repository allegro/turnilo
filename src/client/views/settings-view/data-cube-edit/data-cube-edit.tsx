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

import { Duration, Timezone } from 'chronoshift';

import { DATA_CUBES_STRATEGIES_LABELS } from '../../../config/constants';

import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';
import { SimpleList } from '../../../components/simple-list/simple-list';
import { ImmutableInput } from '../../../components/immutable-input/immutable-input';
import { ImmutableList } from '../../../components/immutable-list/immutable-list';
import { ImmutableDropdown } from '../../../components/immutable-dropdown/immutable-dropdown';

import { DimensionModal } from '../dimension-modal/dimension-modal';
import { MeasureModal } from '../measure-modal/measure-modal';

import { AppSettings, ListItem, Cluster, DataCube, Dimension, DimensionJS, Measure, MeasureJS } from '../../../../common/models/index';

import { DATA_CUBE as LABELS } from '../../../../common/models/labels';


export interface DataCubeEditProps extends React.Props<any> {
  settings: AppSettings;
  cubeId?: string;
  tab?: string;
  onSave: (settings: AppSettings) => void;
}

export interface DataCubeEditState {
  tab?: any;
  dataCube?: DataCube;

  myDataCube?: DataCube;
  hasChanged?: boolean;
  canSave?: boolean;
  errors?: any;
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

  constructor() {
    super();

    this.state = {hasChanged: false, errors: {}};
  }

  componentWillReceiveProps(nextProps: DataCubeEditProps) {
    if (nextProps.settings) {
      this.initFromProps(nextProps);
    }
  }

  initFromProps(props: DataCubeEditProps) {
    let dataCube = props.settings.dataCubes.filter((d) => d.name === props.cubeId)[0];

    this.setState({
      myDataCube: new DataCube(dataCube.valueOf()),
      hasChanged: false,
      canSave: true,
      errors: {},
      dataCube,
      tab: this.tabs.filter((tab) => tab.value === props.tab)[0]
    });
  }

  selectTab(tab: string) {
    var hash = window.location.hash.split('/');
    hash.splice(-1);
    window.location.hash = hash.join('/') + '/' + tab;
  }

  renderTabs(activeTab: Tab): JSX.Element[] {
    return this.tabs.map(({label, value}) => {
      return <button
        className={classNames({active: activeTab.value === value})}
        key={value}
        onClick={this.selectTab.bind(this, value)}
      >{label}</button>;
    });
  }

  cancel() {
    this.setState({myDataCube: undefined}, () => this.initFromProps(this.props));
  }

  save() {
    const { settings } = this.props;
    const { myDataCube, dataCube } = this.state;

    var newCubes = settings.dataCubes;
    newCubes[newCubes.indexOf(dataCube)] = myDataCube;
    var newSettings = settings.changeDataCubes(newCubes);

    if (this.props.onSave) {
      this.props.onSave(newSettings);
    }
  }

  goBack() {
    const { cubeId, tab } = this.props;
    var hash = window.location.hash;
    window.location.hash = hash.replace(`/${cubeId}/${tab}`, '');
  }

  onChange(newCube: DataCube, isValid: boolean, path: string, error: string) {
    const { dataCube, errors } = this.state;

    errors[path] = isValid ? false : error;

    const hasChanged = !isValid || !dataCube.equals(newCube);

    var canSave = true;
    for (let key in errors) canSave = canSave && (errors[key] === false);

    if (isValid) {
      this.setState({
        myDataCube: newCube,
        canSave,
        errors,
        hasChanged
      });
    } else {
      this.setState({
        canSave,
        errors,
        hasChanged
      });
    }
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
    const { settings } = this.props;
    const { myDataCube, errors } = this.state;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors);
    var makeTextInput = ImmutableInput.simpleGenerator(myDataCube, this.onChange.bind(this));
    var makeDropDownInput = ImmutableDropdown.simpleGenerator(myDataCube, this.onChange.bind(this));

    var possibleClusters = [
      { value: 'native', label: 'Load a file and serve it natively' }
    ].concat(settings.clusters.map((cluster) => {
      return { value: cluster.name, label: cluster.name };
    }));

    return <form className="general vertical">
      {makeLabel('title')}
      {makeTextInput('title', /^.+$/, true)}

      {makeLabel('description')}
      {makeTextInput('description')}

      {makeLabel('clusterName')}
      {makeDropDownInput('clusterName', possibleClusters)}

      {makeLabel('introspection')}
      {makeDropDownInput('introspection', this.getIntrospectionStrategies())}

      {makeLabel('source')}
      {makeTextInput('source')}

      {makeLabel('subsetFormula')}
      {makeTextInput('subsetFormula')}

      {makeLabel('defaultDuration')}
      <ImmutableInput
        instance={myDataCube}
        path={'defaultDuration'}
        onChange={this.onChange.bind(this)}

        valueToString={(value: Duration) => value ? value.toJS() : undefined}
        stringToValue={(str: string) => str ? Duration.fromJS(str) : undefined}
      />

      {makeLabel('defaultTimezone')}
      <ImmutableInput
        instance={myDataCube}
        path={'defaultTimezone'}
        onChange={this.onChange.bind(this)}

        valueToString={(value: Timezone) => value ? value.toJS() : undefined}
        stringToValue={(str: string) => str ? Timezone.fromJS(str) : undefined}
      />

      {makeLabel('defaultSortMeasure')}
      {makeDropDownInput('defaultSortMeasure', myDataCube.measures.map(m => { return { value: m.name, label: m.title } ; }).toArray()) }

    </form>;
  }

  renderAttributes(): JSX.Element {
    const { myDataCube, errors } = this.state;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors);

    return <form className="general vertical">

      {makeLabel('attributeOverrides')}
      <ImmutableInput
        instance={myDataCube}
        path={'attributeOverrides'}
        onChange={this.onChange.bind(this)}

        valueToString={(value: AttributeInfo[]) => value ? JSON.stringify(AttributeInfo.toJSs(value), null, 2) : undefined}
        stringToValue={(str: string) => str ? AttributeInfo.fromJSs(JSON.parse(str)) : undefined}
        type="textarea"
      />

    </form>;
  }

  renderDimensions(): JSX.Element {
    const { myDataCube } = this.state;

    const onChange = (newDimensions: List<Dimension>) => {
      const newCube = myDataCube.changeDimensions(newDimensions);
      this.setState({
        myDataCube: newCube,
        hasChanged: !this.state.dataCube.equals(newCube)
      });
    };

    const getModal = (item: Dimension) => <DimensionModal dimension={item} dimensions={myDataCube.dimensions}/>;

    const getNewItem = () => Dimension.fromJS({name: 'new-dimension'});

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
      items={myDataCube.dimensions}
      onChange={onChange.bind(this)}
      getModal={getModal}
      getNewItem={getNewItem}
      getRows={getRows}
    />;
  }

  renderMeasures(): JSX.Element {
    var { myDataCube } = this.state;

    const onChange = (newMeasures: List<Measure>) => {

      var { defaultSortMeasure } = myDataCube;

      if (defaultSortMeasure) {
        if (!newMeasures.find((measure) => measure.name === defaultSortMeasure)) {
          myDataCube = myDataCube.changeDefaultSortMeasure(newMeasures.get(0).name);
        }
      }

      const newCube = myDataCube.changeMeasures(newMeasures);
      this.setState({
        myDataCube: newCube,
        hasChanged: !this.state.dataCube.equals(newCube)
      });
    };

    const getModal = (item: Measure) => <MeasureModal measure={item} measures={myDataCube.measures}/>;

    const getNewItem = () => Measure.fromJS({name: 'new-measure'});

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
      items={myDataCube.measures}
      onChange={onChange.bind(this)}
      getModal={getModal}
      getNewItem={getNewItem}
      getRows={getRows}
    />;
  }

  renderButtons(): JSX.Element {
    const { hasChanged, canSave } = this.state;

    const cancelButton = <Button
      className="cancel"
      title="Revert changes"
      type="secondary"
      onClick={this.cancel.bind(this)}
    />;

    const saveButton = <Button
      className={classNames("save", {disabled: !canSave || !hasChanged})}
      title="Save"
      type="primary"
      onClick={this.save.bind(this)}
    />;

    if (!hasChanged) {
      return <div className="button-group">
        {saveButton}
      </div>;
    }

    return <div className="button-group">
      {cancelButton}
      {saveButton}
    </div>;
  }

  render() {
    const { myDataCube, tab, hasChanged, dataCube, canSave } = this.state;

    if (!myDataCube || !tab || !dataCube) return null;

    return <div className="data-cube-edit">
      <div className="title-bar">
        <Button className="button back" type="secondary" svg={require('../../../icons/full-back.svg')} onClick={this.goBack.bind(this)}/>
        <div className="title">{dataCube.title}</div>
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

require('./dimension-modal.css');

import * as React from 'react';
import { Fn } from '../../../../common/utils/general/general';
import { classNames, enterKey } from '../../../utils/dom/dom';


import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';
import { ImmutableInput } from '../../../components/immutable-input/immutable-input';
import { Modal } from '../../../components/modal/modal';
import { Dropdown } from '../../../components/dropdown/dropdown';

import { Dimension } from '../../../../common/models/index';


export interface DimensionModalProps extends React.Props<any> {
  dimension?: Dimension;
  onSave?: (dimension: Dimension) => void;
  onClose?: () => void;
}

export interface DimensionModalState {
  newDimension?: Dimension;
  canSave?: boolean;
}

export interface DimensionKind {
  label: string;
  value: string;
}


export class DimensionModal extends React.Component<DimensionModalProps, DimensionModalState> {
  private kinds: DimensionKind[] = [
    {label: 'Time', value: 'time'},
    {label: 'String', value: 'string'},
    {label: 'Boolean', value: 'boolean'},
    {label: 'String-geo', value: 'string-geo'}
  ];

  constructor() {
    super();
    this.state = {canSave: false};
  }

  initStateFromProps(props: DimensionModalProps) {
    if (props.dimension) {
      this.setState({
        newDimension: new Dimension(props.dimension.valueOf()),
        canSave: true
      });
    }
  }

  componentWillReceiveProps(nextProps: DimensionModalProps) {
    this.initStateFromProps(nextProps);
  }

  componentDidMount() {
    this.initStateFromProps(this.props);
  }

  onKindChange(newKind: DimensionKind) {
    var dimension = this.state.newDimension;
    dimension = dimension.changeKind(newKind.value);

    this.setState({
      newDimension: dimension,
      canSave: !this.props.dimension.equals(dimension)
    });
  }

  onChange(newDimension: Dimension, isValid: boolean) {
    if (isValid) {
      this.setState({
        newDimension,
        canSave: !this.props.dimension.equals(newDimension)
      });
    } else {
      this.setState({canSave: false});
    }
  }

  save() {
    this.props.onSave(this.state.newDimension);
  }

  render(): JSX.Element {
    const { dimension } = this.props;
    const { newDimension, canSave } = this.state;

    if (!newDimension) return null;

    var selectedKind: DimensionKind = this.kinds.filter((d) => d.value === newDimension.kind)[0] || this.kinds[0];

    // Specializing the Dropdown FTW
    const KindDropDown = Dropdown as { new (): Dropdown<DimensionKind>; };

    return <Modal
      className="dimension-modal"
      title={dimension.title}
      onClose={this.props.onClose}
      onEnter={this.save.bind(this)}
    >
      <form className="general vertical">
        <FormLabel label="Title"></FormLabel>
        <ImmutableInput
          focusOnStartUp={true}
          instance={newDimension}
          path={'title'}
          onChange={this.onChange.bind(this)}
          validator={/^.+$/}
        />

        <KindDropDown
          label={'Kind'}
          items={this.kinds}
          selectedItem={selectedKind}
          equal={(a: DimensionKind, b: DimensionKind) => a.value === b.value}
          renderItem={(a: DimensionKind) => a.label}
          keyItem={(a: DimensionKind) => a.value}
          onSelect={this.onKindChange.bind(this)}
        />

      </form>

      <div className="button-group">
        {canSave ? <Button className="save" title="Save" type="primary" onClick={this.save.bind(this)}/> : null}
        <Button className="cancel" title="Cancel" type="secondary" onClick={this.props.onClose}/>
      </div>

    </Modal>;
  }

}

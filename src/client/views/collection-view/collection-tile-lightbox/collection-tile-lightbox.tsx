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

require('./collection-tile-lightbox.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Q from 'q';

import { STRINGS } from '../../../config/constants';
import { isInside, classNames } from '../../../utils/dom/dom';

import { SvgIcon, GlobalEventListener, BodyPortal, GoldenCenter, BubbleMenu, ImmutableInput, Notifier } from '../../../components/index';
import { Collection, CollectionTile, VisualizationProps, Stage, Essence, Timekeeper } from '../../../../common/models/index';

import { COLLECTION_ITEM as LABELS } from '../../../../common/models/labels';

import { getVisualizationComponent } from '../../../visualizations/index';

export interface CollectionTileLightboxProps extends React.Props<any> {
  collection?: Collection;
  tileId?: string;
  timekeeper: Timekeeper;
  onEdit?: (collection: Collection, tile: CollectionTile) => void;
  onDelete?: (collection: Collection, tile: CollectionTile) => void;
  onDuplicate?: (collection: Collection, tile: CollectionTile) => Q.Promise<string>;
  onChange?: (collection: Collection, tile: CollectionTile) => Q.Promise<any>;
}

export interface CollectionTileLightboxState {
  tile?: CollectionTile;
  visualizationStage?: Stage;
  editMenuOpen?: boolean;
  moreMenuOpen?: boolean;
  editionMode?: boolean;
  tempTile?: CollectionTile;
}

export class CollectionTileLightbox extends React.Component<CollectionTileLightboxProps, CollectionTileLightboxState> {
  constructor() {
    super();

    this.state = {};
  }

  componentWillReceiveProps(nextProps: CollectionTileLightboxProps) {
    const { collection, tileId } = nextProps;

    if (collection) {
      let tile = collection.tiles.filter(({name}) => tileId === name)[0];

      this.setState({
        tile
      });
    }
  }

  updateStage() {
    var { visualization } = this.refs;
    var visualizationDOM = ReactDOM.findDOMNode(visualization);

    if (!visualizationDOM) return;

    this.setState({
      visualizationStage: Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
    });
  }

  onExplore() {
    const essence = this.state.tile.essence as Essence;
    window.location.hash = '#' + essence.getURL(essence.dataCube.name + '/');
  }

  onEditIconClick() {
    this.setState({
      editMenuOpen: !this.state.editMenuOpen,
      moreMenuOpen: false
    });
  }

  onMoreIconClick() {
    this.setState({
      moreMenuOpen: !this.state.moreMenuOpen,
      editMenuOpen: false
    });
  }

  closeModal() {
    window.location.hash = `#collection/${this.props.collection.name}`;
  }

  onEscape() {
    if (this.state.editionMode) {
      this.setState({
        editionMode: false,
        tempTile: null
      });
      return;
    }

    if (this.state.editMenuOpen) return;

    this.closeModal();
  }

  editTitleAndDesc() {
    this.setState({
      editMenuOpen: false,
      editionMode: true,
      tempTile: new CollectionTile(this.state.tile.valueOf())
    });
  }

  renderEditMenu() {
    const { onEdit, collection } = this.props;
    const { tile } = this.state;
    var onClose = () => this.setState({editMenuOpen: false});

    const edit = () => onEdit(collection, tile);

    return <BubbleMenu
      className="edit-menu"
      direction="down"
      stage={Stage.fromSize(200, 200)}
      openOn={this.refs['edit-button'] as any}
      onClose={onClose}
    >
      <ul className="bubble-list">
        <li className="edit-title-and-desc" onClick={this.editTitleAndDesc.bind(this)}>{STRINGS.editTitleAndDesc}</li>
        <li className="edit-vizualization" onClick={edit}>{STRINGS.editVisualization}</li>
      </ul>
    </BubbleMenu>;
  }

  renderMoreMenu() {
    const { onDelete, collection, onDuplicate } = this.props;
    const { tile } = this.state;
    var onClose = () => this.setState({moreMenuOpen: false});

    const remove = () => onDelete(collection, tile);
    const duplicate = () => {
      onDuplicate(collection, tile).then(url => {
        window.location.hash = url;
        onClose();
        Notifier.success('Tile duplicated');
      });
    };

    return <BubbleMenu
      className="more-menu"
      direction="down"
      stage={Stage.fromSize(200, 200)}
      openOn={this.refs['more-button'] as any}
      onClose={onClose}
    >
      <ul className="bubble-list">
        <li className="duplicate-tile" onClick={duplicate}>{STRINGS.duplicateCollectionTile}</li>
        <li className="delete-tile" onClick={remove}>{STRINGS.deleteCollectionTile}</li>
      </ul>
    </BubbleMenu>;
  }

  onMouseDown(e: MouseEvent) {
    const { editMenuOpen, moreMenuOpen } = this.state;

    const target = e.target as Element;
    const modal = this.refs['modal'] as any;
    const leftArrow = this.refs['left-arrow'] as any;
    const rightArrow = this.refs['right-arrow'] as any;

    if (isInside(target, modal)) return;
    if (isInside(target, leftArrow)) return;
    if (isInside(target, rightArrow)) return;

    if (editMenuOpen || moreMenuOpen) return;

    this.closeModal();
  }

  swipe(direction: number) {
    const { collection } = this.props;
    const { tile } = this.state;

    const tiles = collection.tiles;

    var newIndex = tiles.indexOf(tile) + direction;

    if (newIndex >= tiles.length) newIndex = 0;
    if (newIndex < 0) newIndex = tiles.length - 1;

    window.location.hash = `#collection/${collection.name}/${tiles[newIndex].name}`;
  }

  onEnter() {
    if (this.state.editionMode) this.saveEdition();
  }

  saveEdition() {
    const { collection } = this.props;
    const { tempTile } = this.state;

    this.props.onChange(collection, tempTile).then(() => {
      this.setState({
        tile: tempTile,
        tempTile: null,
        editionMode: false
      });
    });
  }

  renderHeadBand(): JSX.Element {
    const { onEdit } = this.props;
    const { editionMode, tempTile, tile, editMenuOpen, moreMenuOpen } = this.state;

    var editButton: JSX.Element = null;
    var moreButton: JSX.Element = null;
    if (onEdit) {
      editButton = <div
        className={classNames('edit-button icon', {active: editMenuOpen})}
        onClick={this.onEditIconClick.bind(this)}
        ref="edit-button"
      >
        <SvgIcon svg={require(`../../../icons/full-edit.svg`)}/>
      </div>;

      moreButton = <div
        className={classNames('more-button icon', {active: moreMenuOpen})}
        onClick={this.onMoreIconClick.bind(this)}
        ref="more-button"
      >
        <SvgIcon svg={require(`../../../icons/full-more.svg`)}/>
      </div>;
    }

    if (!editionMode) {
      return <div className="headband grid-row">
        <div className="grid-col-70 vertical">
          <div className="title actionable" onClick={this.editTitleAndDesc.bind(this)}>{tile.title}</div>
          <div className="description actionable" onClick={this.editTitleAndDesc.bind(this)}>{tile.description}</div>
        </div>
        <div className="grid-col-30 right middle">
          <div className="explore-button" onClick={this.onExplore.bind(this)}>
            {STRINGS.explore}
          </div>
          {editButton}
          {moreButton}
          <div className="separator"/>
          <div className="close-button icon" onClick={this.closeModal.bind(this)}>
            <SvgIcon svg={require(`../../../icons/full-remove.svg`)}/>
          </div>
        </div>
      </div>;
    }

    var onChange = (newItem: CollectionTile) => {
      this.setState({tempTile: newItem});
    };

    var makeTextInput = ImmutableInput.simpleGenerator(tempTile, onChange);

    var cancel = () => {
      this.setState({
        editionMode: false,
        tempTile: null
      });
    };

    return <div className="headband grid-row">
      <div className="grid-col-70 vertical enable-overflow">
        {makeTextInput('title', /.*/, true)}
        {makeTextInput('description')}
      </div>
      <div className="grid-col-30 right middle">
        <div className="cancel-button" onClick={cancel}>{STRINGS.cancel}</div>
        <div className="save-button" onClick={this.saveEdition.bind(this)}>{STRINGS.save}</div>
      </div>
    </div>;
  }

  render() {
    const { timekeeper } = this.props;
    const { tile, visualizationStage, editMenuOpen, moreMenuOpen } = this.state;

    if (!tile) return null;

    var { essence } = tile;

    var visElement: JSX.Element = null;
    if (essence.visResolve.isReady() && visualizationStage) {
      var visProps: VisualizationProps = {
        clicker: {},
        essence,
        timekeeper,
        stage: visualizationStage
      };

      visElement = React.createElement(getVisualizationComponent(essence.visualization), visProps);
    }

    return <BodyPortal fullSize={true} onMount={this.updateStage.bind(this)}>
      <div className="collection-tile-lightbox">

        <GlobalEventListener
          resize={this.updateStage.bind(this)}
          escape={this.onEscape.bind(this)}
          enter={this.onEnter.bind(this)}
          mouseDown={this.onMouseDown.bind(this)}
          left={this.swipe.bind(this, -1)}
          right={this.swipe.bind(this, 1)}
        />

        <div className="backdrop"/>
        <GoldenCenter>
          <div className="modal-window" ref="modal">
            {this.renderHeadBand()}
            <div className="content" ref="visualization">
              {visElement}
            </div>
          </div>
        </GoldenCenter>
        <div className="left-arrow" onClick={this.swipe.bind(this, -1)} ref="left-arrow">
          <SvgIcon svg={require(`../../../icons/full-caret-left-line.svg`)}/>
        </div>

        <div className="right-arrow" onClick={this.swipe.bind(this, 1)} ref="right-arrow">
          <SvgIcon svg={require(`../../../icons/full-caret-right-line.svg`)}/>
        </div>

        {editMenuOpen ? this.renderEditMenu() : null}
        {moreMenuOpen ? this.renderMoreMenu() : null}
      </div>
    </BodyPortal>;
  }
}

require('./item-card.css');

import * as React from 'react';
import { STRINGS } from '../../../config/constants';
import { SvgIcon } from '../../../components/svg-icon/svg-icon';

export interface ItemCardProps extends React.Props<any> {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

export interface ItemCardState {
}

export class ItemCard extends React.Component< ItemCardProps, ItemCardState> {
  render() {
    const { title, description, icon, onClick } = this.props;

    return <div className="item-card" onClick={onClick}>
      <div className="inner-container">
        <SvgIcon svg={require(`../../../icons/${icon}.svg`)}/>
        <div className="text">
          <div className="title">{title}</div>
          <div className="description">{description || STRINGS.noDescription}</div>
        </div>
      </div>
    </div>;
  }
}

require('./hiluk-menu.css');

import * as React from 'react';
import { Dataset } from 'plywood';
import { Fn } from "../../../common/utils/general/general";
import { Stage, Essence, ExternalView } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { download, makeFileName } from "../../utils/download/download";
import { BubbleMenu } from '../bubble-menu/bubble-menu';


export interface HilukMenuProps extends React.Props<any> {
  essence: Essence;
  openOn: Element;
  onClose: Fn;
  getUrlPrefix: () => string;
  openRawDataModal: Fn;
  externalViews?: ExternalView[];
  getVisualizationDataset?: () => Dataset;
}

export interface HilukMenuState {
  url?: string;
  specificUrl?: string;
}

export class HilukMenu extends React.Component<HilukMenuProps, HilukMenuState> {

  constructor() {
    super();
    this.state = {
      url: null,
      specificUrl: null
    };

  }

  componentDidMount() {
    var { essence, getUrlPrefix } = this.props;

    var urlPrefix = getUrlPrefix();
    var url = essence.getURL(urlPrefix);
    var specificUrl = essence.filter.isRelative() ? essence.convertToSpecificFilter().getURL(urlPrefix) : null;

    this.setState({
      url,
      specificUrl
    });
  }

  openRawDataModal() {
    const { openRawDataModal, onClose } = this.props;
    openRawDataModal();
    onClose();
  }

  onExport() {
    const { onClose, getVisualizationDataset, essence } = this.props;
    const { dataSource, splits } = essence;
    const filters = essence.getEffectiveFilter().getFileString(dataSource.timeAttribute);
    var splitsString = splits.toArray().map((split) => {
      var dimension = split.getDimension(dataSource.dimensions);
      if (!dimension) return '';
      return `${STRINGS.splitDelimiter}_${dimension.name}`;
    }).join("_");
    if (!getVisualizationDataset) return;
    var dataset = getVisualizationDataset();
    if (!dataset) return;

    download(dataset, makeFileName(dataSource.name, filters, splitsString), 'csv');
    onClose();
  }

  render() {
    const { openOn, onClose, externalViews, essence, getVisualizationDataset } = this.props;
    const { url, specificUrl } = this.state;

    var shareOptions: JSX.Element[] = [
      <li
        className="copy-url clipboard"
        key="copy-url"
        data-clipboard-text={url}
        onClick={onClose}
      >{STRINGS.copyUrl}</li>
    ];

    if (specificUrl) {
      shareOptions.push(<li
        className="copy-specific-url clipboard"
        key="copy-specific-url"
        data-clipboard-text={specificUrl}
        onClick={onClose}
      >{STRINGS.copySpecificUrl}</li>);
    }

    shareOptions.push(<li
      className="view-raw-data"
      key="view-raw-data"
      onClick={this.openRawDataModal.bind(this)}
    >{STRINGS.viewRawData}</li>);

    if (getVisualizationDataset()) {
      shareOptions.push(<li
        className="export"
        key="export"
        onClick={this.onExport.bind(this)}
      >{STRINGS.exportToCSV}</li>);
    }

    if (externalViews) {
      externalViews.forEach((externalView: ExternalView, i: number) => {
        const url = externalView.linkGeneratorFn(essence.dataSource, essence.timezone, essence.filter, essence.splits);
        if (typeof url !== "string") return;
        var title = `${STRINGS.openIn} ${externalView.title}`;
        var target = externalView.sameWindow ? "_self" : "_blank";
        shareOptions.push(<li key={`custom-url-${i}`}>
          <a
            href={url}
            target={target}
          >
            {title}
          </a>
        </li>);
      });
    }

    var stage = Stage.fromSize(200, 200);
    return <BubbleMenu
      className="hiluk-menu"
      direction="down"
      stage={stage}
      openOn={openOn}
      onClose={onClose}
    >
      <ul className="bubble-list">
        {shareOptions}
      </ul>
    </BubbleMenu>;
  }
}

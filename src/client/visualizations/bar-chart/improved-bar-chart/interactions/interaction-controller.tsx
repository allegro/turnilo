/*
 * Copyright 2017-2018 Allegro.pl
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

import { List } from "immutable";
import { Datum, Range, TimeRange } from "plywood";
import React from "react";
import { DateRange } from "../../../../../common/models/date-range/date-range";
import { FilterClause, FixedTimeFilterClause } from "../../../../../common/models/filter-clause/filter-clause";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Binary, Unary } from "../../../../../common/utils/functional/functional";
import { safeEquals } from "../../../../../common/utils/immutable-utils/immutable-utils";
import { ScrollerPart } from "../../../../components/scroller/scroller";
import { toPlywoodRange } from "../../../../utils/highlight-clause/highlight-clause";
import { Highlight } from "../../../highlight-controller/highlight";
import { BarChartModel } from "../utils/bar-chart-model";
import { BarChartLayout } from "../utils/layout";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";
import { createHighlight, createHover, equalInteractions, Hover, Interaction } from "./interaction";

interface InteractionProps {
  onClick?: (x: number, y: number, part: ScrollerPart) => void;
  onMouseMove?: (x: number, y: number, part: ScrollerPart) => void;
  onMouseLeave?: () => void;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  scrollLeft: number;
  scrollTop: number;
  interaction: Interaction | null;
}

interface InteractionControllerProps {
  xScale: XScale;
  model: BarChartModel;
  datums: Datum[];
  layout: BarChartLayout;
  children: Unary<InteractionProps, React.ReactNode>;
  highlight?: Highlight;
  saveHighlight: Binary<List<FilterClause>, string, void>;
}

interface InteractionControllerState {
  hover?: Hover;
  scrollLeft: number;
  scrollTop: number;
}

export class InteractionController extends React.Component<InteractionControllerProps, InteractionControllerState> {

  state: InteractionControllerState = { hover: null, scrollLeft: 0, scrollTop: 0 };

  saveScroll = (scrollTop: number, scrollLeft: number) => {
    this.setState({
      hover: null,
      scrollLeft,
      scrollTop
    });
  };

  saveHover = (x: number, y: number, part: ScrollerPart) => {
    const { highlight } = this.props;
    if (highlight) return;
    const value = this.getValueFromEvent(x, part);
    if (!Range.isRange(value)) return;
    const series = this.getSeriesFromEvent(y, part);
    if (series === null) return;
    const datum = this.findDatumByValue(value);
    const hover = createHover(series.plywoodKey(), datum);
    const { hover: oldHover } = this.state;
    if (oldHover && equalInteractions(oldHover, hover)) return;
    this.setState({ hover });
  };

  resetHover = () => {
    const { hover } = this.state;
    if (hover) {
      this.setState({ hover: null });
    }
  };

  handleClick = (x: number, y: number, part: ScrollerPart) => {
    const value = this.getValueFromEvent(x, part);
    if (!TimeRange.isTimeRange(value)) return;
    this.setState({ hover: null });
    const series = this.getSeriesFromEvent(y, part);
    if (series === null) return;
    const { saveHighlight, model } = this.props;
    const { reference } = model.continuousSplit;
    const values = List.of(new DateRange(value));
    const clause = new FixedTimeFilterClause({ reference, values });
    saveHighlight(List.of(clause), series.plywoodKey());
  };

  getValueFromEvent(x: number, part: ScrollerPart): DomainValue | null {
    if (part !== "body") return null;
    const { layout, xScale } = this.props;
    return xScale.invert(x - layout.scroller.left);
  }

  findDatumByValue(value: DomainValue): Datum | null {
    const { model: { continuousSplit }, datums } = this.props;
    return datums.find(datum => safeEquals(value, continuousSplit.selectValue(datum)));
  }

  getSeriesFromEvent(y: number, part: ScrollerPart): ConcreteSeries | null {
    if (part !== "body") return null;
    const { layout: { segment: { height: seriesHeight } }, model: { series } } = this.props;
    const index = Math.floor(y / seriesHeight);
    return series.get(index) || null;
  }

  interaction(): Interaction | null {
    const { highlight } = this.props;
    if (highlight) {
      const value = toPlywoodRange(highlight.clauses.first());
      const datum = this.findDatumByValue(value);
      return createHighlight(highlight.key, datum);
    }
    return this.state.hover;
  }

  render() {
    const { children } = this.props;
    const { scrollLeft, scrollTop } = this.state;
    return children({
      interaction: this.interaction(),
      scrollLeft,
      scrollTop,
      onScroll: this.saveScroll,
      onMouseLeave: this.resetHover,
      onMouseMove: this.saveHover,
      onClick: this.handleClick
    });
  }
}

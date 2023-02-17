/*
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

import { Set } from "immutable";
import { Dataset } from "plywood";
import React from "react";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { BooleanFilterClause, FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { STRINGS } from "../../../config/constants";
import { ApiContext, ApiContextValue } from "../../../views/cube-view/api-context";
import { BubbleMenu } from "../../bubble-menu/bubble-menu";
import { Button } from "../../button/button";
import { Checkbox } from "../../checkbox/checkbox";
import { Loader } from "../../loader/loader";
import { QueryError } from "../../query-error/query-error";
import "./boolean-filter-menu.scss";

interface BooleanFilterMenuProps {
  dimension: Dimension;
  saveClause: Unary<FilterClause, void>;
  essence: Essence;
  onClose: Fn;
  containerStage?: Stage;
  openOn: Element;
}

export type Booleanish = string | boolean | null;

interface BooleanFilterMenuState {
  loading?: boolean;
  error?: Error;
  values: Booleanish[];
  selectedValues: Set<Booleanish>;
}

export class BooleanFilterMenu extends React.Component<BooleanFilterMenuProps, BooleanFilterMenuState> {
  static contextType = ApiContext;

  context: ApiContextValue;

  state = this.initialValues();

  initialValues(): BooleanFilterMenuState {
    const { essence: { filter }, dimension } = this.props;
    const clause = filter.getClauseForDimension(dimension);
    if (!clause) {
      return { selectedValues: Set.of(), values: [] };
    }
    if (!(clause instanceof BooleanFilterClause)) {
      throw new Error(`Expected boolean filter clause, got: ${clause}`);
    }
    return { selectedValues: clause.values, values: [] };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { booleanFilterQuery } = this.context;
    const { essence, dimension } = this.props;

    this.setState({ loading: true });
    booleanFilterQuery(essence, dimension)
      .then(
        (dataset: Dataset) => {
          this.setState({
            loading: false,
            values: dataset.data.map(d => d[dimension.name] as Booleanish),
            error: null
          });
        },
        error => {
          this.setState({
            loading: false,
            values: [],
            error
          });
        }
      );

  }

  constructClause(): BooleanFilterClause | null {
    const { selectedValues } = this.state;
    if (selectedValues.isEmpty()) return null;

    const { dimension } = this.props;
    return new BooleanFilterClause({
      reference: dimension.name,
      values: selectedValues
    });
  }

  actionEnabled(): boolean {
    const { essence: { filter }, dimension } = this.props;
    const newClause = this.constructClause();
    const oldClause = filter.getClauseForDimension(dimension);
    return newClause && !newClause.equals(oldClause);
  }

  onOkClick = () => {
    if (!this.actionEnabled()) return;
    const { saveClause, onClose } = this.props;
    saveClause(this.constructClause());
    onClose();
  };

  onCancelClick = () => {
    const { onClose } = this.props;
    onClose();
  };

  selectValue = (value: Booleanish) => {
    const { selectedValues } = this.state;
    const newSelection = selectedValues.has(value) ? selectedValues.remove(value) : selectedValues.add(value);
    this.setState({ selectedValues: newSelection });
  };

  renderRow = (value: Booleanish) => {
    const { selectedValues } = this.state;
    return <div
      className="row"
      key={String(value)}
      title={String(value)}
      onClick={() => this.selectValue(value)}>
      <div className="row-wrapper">
        <Checkbox selected={selectedValues.has(value)} />
        <span className="label">{String(value)}</span>
      </div>
    </div>;
  };

  render() {
    const { onClose, containerStage, openOn } = this.props;
    const { values, error, loading } = this.state;

    return <BubbleMenu
      className="boolean-filter-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(250, 210)}
      openOn={openOn}
      onClose={onClose}>
      <div className="menu-table">
        <div className="rows">
          {values.map(this.renderRow)}
        </div>
        {error && <QueryError error={error} />}
        {loading && <Loader />}
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick} disabled={!this.actionEnabled()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick} />
      </div>
    </BubbleMenu>;
  }
}

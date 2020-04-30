/*
 * Copyright 2017-2019 Allegro.pl
 * Copyright 2020 Remerge GmbH
 */
import { Duration } from "chronoshift";
import * as mixpanel from "mixpanel-browser";
import { Essence } from "../../common/models/essence/essence";
import { BooleanFilterClause, FixedTimeFilterClause, NumberFilterClause, RelativeTimeFilterClause, StringFilterAction, StringFilterClause } from "../../common/models/filter-clause/filter-clause";
import { SplitType } from "../../common/models/split/split";
import { getFormattedClause } from "../../common/utils/formatter/formatter";
import { reportError } from "../utils/error-reporter/error-reporter";
import { clientConfig } from "./client-config";
import { parseIdToken, removeIdToken } from "./id-token";

function encodedLocation(): string {
  return encodeURIComponent(window.location.href);
}

let enabled = false;

function track(name: string, data: { [key: string]: any }, onPageUnload = false) {
  if (enabled) {
    const transport = onPageUnload ? "sendBeacon" : "xhr";
    return mixpanel.track(name, data, { transport });
  }

  console.log("Track", name, data);
}

function measureLabel(measure: string, essence: Essence) {
  return essence.dataCube.getMeasure(measure).title;
}

interface TimeFilterDetails {
  dimension: "time";
  value: string;
}

interface StringFilterDetails {
  dimension: string;
  action: StringFilterAction;
  values: String[];
}

interface NumberFilterDetails {
  dimension: string;
  from: number | "min";
  to: number | "max";
}

type FilterDetails = TimeFilterDetails | StringFilterDetails | NumberFilterDetails;

function isTimeFilter(filter: any): filter is TimeFilterDetails {
  return filter.dimension === "time";
}

function ensureExaustive(value: never): any {
  throw new Error(`Unsupported option ${value}`);
}

function trackableFilters(essence: Essence): FilterDetails[] {
  const dataCube = essence.dataCube;

  return Array.from(essence.filter.clauses.map(clause => {
    const dimension = dataCube.getDimension(clause.reference);

    if (clause instanceof RelativeTimeFilterClause || clause instanceof FixedTimeFilterClause) {
      return {
        dimension: "time",
        value: getFormattedClause(dimension, clause, essence.timezone).values
      };
    }

    if (clause instanceof StringFilterClause) {
      const stringFilterClause = {
        dimension: dimension.title,
        action: clause.action,
        values: Array.from(clause.values)
      };

      if (clause.not) return { ...stringFilterClause, negated: true };
      return stringFilterClause;
    }

    if (clause instanceof NumberFilterClause) {
      const range = clause.values.get(0);

      const numberFilterClause = {
        dimension: dimension.title,
        from: range.start || "min",
        to: range.end || "max"
      };

      if (clause.not) return { ...numberFilterClause, negated: true };
      return numberFilterClause;
    }

    if (clause instanceof BooleanFilterClause) {
      const booleanFilterClause = {
        dimension: dimension.title,
        values: Array.from(clause.values)
      };

      if (clause.not) return { ...booleanFilterClause, negated: true };
      return booleanFilterClause;
    }

    return ensureExaustive(clause);
  }));
}

interface SplitDetail {
  dimension: string;
  limit?: number;
  duration?: string;
}

function trackableSplits(essence: Essence): SplitDetail[] {
  const { dataCube } = essence;

  return Array.from (essence.splits.splits.map(split => {
    const dimension = dataCube.getDimension(split.reference);

    const splitDetail: SplitDetail = { dimension: dimension.title };

    const limit = split.limit;
    if (limit && limit > 0) {
      splitDetail.limit = limit;
    } else {
      // The other visualizations automatically set the default limit
      if (split.type !== SplitType.time && essence.visualization.name === "line-chart") {
        splitDetail.limit = 5;
      }
    }

    if (split.type === SplitType.time) {
      const duration = split.bucket as Duration;
      splitDetail.duration = duration.getDescription();
    }

    return splitDetail;
  }));
}

let lastViewData: { visualization: string, essence: Essence, timeToRender: number, viewStartAt: number };

function sendLastViewData(onPageUnload = false) {
  try {
    if (!lastViewData) return;

    const { visualization, essence, timeToRender, viewStartAt } = lastViewData;

    const splits = trackableSplits(essence);
    const kpis = Array.from(essence.series.series.map(measure => measureLabel(measure.reference, essence)));
    const filters = trackableFilters(essence);

    const timeFilter = filters.find(isTimeFilter).value;
    const nonTimeFilters = filters.filter(filter => !isTimeFilter(filter));

    const timeShift = essence.timeShift;

    track("view-data", {
      time: viewStartAt,
      $duration: Date.now() / 1000 - viewStartAt,
      reportDuration: timeFilter,
      timeShift: timeShift.value && timeShift.getDescription(),
      filters: nonTimeFilters.map(filter => filter.dimension),
      filterDetails: nonTimeFilters,
      splits: splits.map(split => split.dimension),
      splitsDetails: splits,
      kpis,
      visualization,
      timeToRender,
      timezone: essence.timezone.toString()
    }, onPageUnload);

  } catch (error) {
    reportError(error);
  } finally {
    lastViewData = undefined;
  }
}

export function trackLoadData() {
  sendLastViewData();
}

export function trackViewData(visualization: string, essence: Essence, timeToRender: number) {
  const secondsSinceLastTrackCall = lastViewData ? Date.now() / 1000 - lastViewData.viewStartAt : 0;
  if (secondsSinceLastTrackCall <= 10) {
    lastViewData = undefined;
    return;
  }
  sendLastViewData();

  lastViewData = {
    visualization,
    essence,
    timeToRender,
    viewStartAt: Date.now() / 1000
  };
}

export function init() {
  const { mixpanelToken, loginUrl } = clientConfig();

  window.addEventListener("beforeunload", () => sendLastViewData(true));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      sendLastViewData();
    }
  });

  if (mixpanelToken) {
    const idToken = parseIdToken();

    if (idToken) {
      mixpanel.init(mixpanelToken);
      mixpanel.identify(idToken.user.id.toString());
      enabled = true;
    } else {
      removeIdToken();
      window.location.href = `${loginUrl}?redirectTo=${encodedLocation()}`;
    }
  }
}

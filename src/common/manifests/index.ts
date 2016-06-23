import { Manifest } from '../models/manifest/manifest';

import { TOTALS_MANIFEST } from './totals/totals';
import { TABLE_MANIFEST } from './table/table';
import { LINE_CHART_MANIFEST } from './line-chart/line-chart';
import { BAR_CHART_MANIFEST } from './bar-chart/bar-chart';
import { GEO_MANIFEST } from './geo/geo';

export const MANIFESTS: Manifest[] = [
  TOTALS_MANIFEST,
  TABLE_MANIFEST,
  LINE_CHART_MANIFEST,
  BAR_CHART_MANIFEST,
  GEO_MANIFEST
];

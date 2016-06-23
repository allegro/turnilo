import { helper } from 'plywood';
import { Manifest } from '../../common/models/manifest/manifest';
import { BaseVisualization } from './base-visualization/base-visualization';

import { Totals } from './totals/totals';
import { Table } from './table/table';
import { LineChart } from './line-chart/line-chart';
import { BarChart } from './bar-chart/bar-chart';
import { Geo } from './geo/geo';

const VIS_COMPONENTS: Array<typeof BaseVisualization> = [
  Totals,
  Table,
  LineChart,
  BarChart,
  Geo
];

export function getVisualizationComponent(manifest: Manifest): typeof BaseVisualization {
  var manifestName = manifest.name;
  return helper.find(VIS_COMPONENTS, (v) => (v as any).id === manifestName);
}

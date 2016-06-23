import { Splits, DataSource, SplitCombine, Colors, Dimension } from '../../models/index';
import { Manifest, Resolve } from '../../models/manifest/manifest';

function handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
  return Resolve.manual(0, 'The Geo visualization is not ready, please select another visualization.', []);
}

export const GEO_MANIFEST = new Manifest(
  'geo',
  'Geo',
  handleCircumstance
);

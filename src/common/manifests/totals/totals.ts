import { Splits, DataSource, SplitCombine, Colors, Dimension } from '../../models/index';
import { Manifest, Resolve } from '../../models/manifest/manifest';

function handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
  if (!splits.length()) return Resolve.ready(10);
  return Resolve.automatic(3, { splits: Splits.EMPTY });
}

export const TOTALS_MANIFEST = new Manifest(
  'totals',
  'Totals',
  handleCircumstance,
  'multi'
);

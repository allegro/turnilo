import { Filter } from '../filter/filter';
import { SplitCombine } from '../split-combine/split-combine';

export interface Clicker {
  setFilter(filter: Filter): void;
  changeSplits(splits: SplitCombine[]): void;
  addSplit(split: SplitCombine): void;
}

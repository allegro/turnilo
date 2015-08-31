'use strict';

import { Clicker } from '../clicker/clicker';
import { Stage } from '../stage/stage';
import { Essence } from '../essence/essence';

export interface VisualizationProps {
  clicker: Clicker;
  essence: Essence;
  stage: Stage;
}

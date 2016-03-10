import { Request } from 'express';
import { User } from '../../../common/models/index';
import { DataSourceManager } from '../data-source-manager/data-source-manager';

export interface PivotRequest extends Request {
  user: User;
  dataSourceManager?: DataSourceManager;
}

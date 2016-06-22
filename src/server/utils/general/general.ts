import { Request } from 'express';
import { User, AppSettings } from '../../../common/models/index';
import { GetSettingsOptions } from '../settings-manager/settings-manager';

export interface PivotRequest extends Request {
  version: string;
  user: User;
  getSettings(opts?: GetSettingsOptions): Q.Promise<AppSettings>;
}

'use babel'

import {crxService} from './CrxService';
import {utils} from './Utils';
import {executor} from './Executor';

export const CONTEXT = {

  platform : "",
  pathSeparator : "",

  filterFile : {},
  filterContent : "",

  crxService : crxService,
  utils : utils,
  executor : executor

};

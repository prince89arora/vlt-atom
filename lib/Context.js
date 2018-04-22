'use babel'

import {crxService} from './CrxService';
import {utils} from './Utils';
import {executor} from './Executor';

export const CONTEXT = {

  platform : "",
  pathSeparator : "",

  filterFile : {},
  filterContent : "",

  vlt_set_status : false,

  checkout_map : [],

  vlt_base : '',

  crxService : crxService,
  utils : utils,
  executor : executor

};

'use babel';

import { File } from 'atom';
import {CONTEXT} from './Context';
import {Constants} from './Constants';

export default class Utils {

  constructor() {}

  getRootPath(path) {
    if (path !== null && path !== "") {
      let index = path.indexOf(Constants.DIR_JCRROOT);
      return (
        path.substring(0, (index + 8))
      )
    }
    return "";
  }

  getCrxPath(path) {
    if (path !== null && path !== "") {
      let index = path.indexOf(Constants.DIR_JCRROOT);
      return (
        path.substring( (index + 8), path.length )
      )
    }
    return "";
  }

  writeFile(file, content) {
    if ( content !== null ) {
      file.writeSync( content );
    }
  }

  emptyContext() {
    CONTEXT.fullPath = "";
    CONTEXT.jcrRootPath = "";
    CONTEXT.filterFile = {};
    CONTEXT.filterContent = "";
    CONTEXT.payloadPath = "";
    CONTEXT.contentPath = "";
    CONTEXT.cmdType = "";
    CONTEXT.isCheckout = false;
  }

  getContentPath(path) {
    return CONTEXT.jcrRootPath.replace(CONTEXT.pathSeparator + Constants.DIR_JCRROOT, "");
  }

  prepareContext( path ) {
    CONTEXT.fullPath = path;
    CONTEXT.jcrRootPath = this.getRootPath(path);
    CONTEXT.payloadPath = this.getCrxPath(path);
    CONTEXT.contentPath = this.getContentPath(path);
  }


}

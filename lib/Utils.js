'use babel';

import { File } from 'atom';
import {CONTEXT} from './Context';

export default class Utils {

  constructor() {}

  getRootPath(path) {
    if (path !== null && path !== "") {
      let index = path.indexOf("jcr_root");
      console.log(index);
      return (
        path.substring(0, (index + 8))
      )
    }
    return "";
  }

  getCrxPath(path) {
    console.log(path);
    if (path !== null && path !== "") {
      let index = path.indexOf("jcr_root");
      return (
        path.substring( (index + 8), path.length )
      )
    }
    return "";
  }


  getMetaPath(path) {
    if (path !== null && path !== "") {
      let index = path.indexOf("jcr_root");
      let basePath = path.substring(0, index);
      basePath = basePath + "META-INF/vault";
      return basePath;
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
    CONTEXT.basePath = "";
    CONTEXT.filterFile = {};
    CONTEXT.filterContent = "";
  }

  getContentPath(path) {
    return CONTEXT.basePath.replace("/jcr_root", "");
  }


}

'use babel';

import { File } from 'atom';
import {CONTEXT} from './Context';
import {Constants} from './Constants';

let utils = {

  getRootPath : function(path) {
    if (path !== null && path !== "") {
      let index = path.indexOf(Constants.DIR_JCRROOT);
      return (
        path.substring(0, (index + 8))
      )
    }
    return "";
  },

  getCrxPath : function(path) {
    if (path !== null && path !== "") {
      let index = path.indexOf(Constants.DIR_JCRROOT);
      return (
        path.substring( (index + 8), path.length )
      )
    }
    return "";
  },

  writeFile : function(file, content) {
    if ( content !== null ) {
      file.writeSync( content );
    }
  },

  getContentPath : function() {

  }

};


export { utils };

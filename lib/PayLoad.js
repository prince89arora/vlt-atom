'use babel'

import {CONTEXT} from './Context';
import { Command } from './Command';
import {Constants} from './Constants';

export class PayLoad {

  constuctor(){
  }

  initPayloadContext( path ) {
    this.fullPath = path;
    this.command = {};

    this.cmdType = "";

    if (path !== null && path !== "") {
      let index = path.indexOf(Constants.DIR_JCRROOT);
      this.jcrRootPath = path.substring(0, (index + 8));
      this.payloadPath = "." + CONTEXT.pathSeparator + Constants.DIR_JCRROOT + path.substring( (index + 8), path.length );
      this.contentPath = this.jcrRootPath.replace(
          CONTEXT.pathSeparator + Constants.DIR_JCRROOT, "");
    }
  }

}

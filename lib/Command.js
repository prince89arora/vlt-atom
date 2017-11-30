'use babel';

import { CompositeDisposable } from 'atom';
import {CONTEXT} from './Context';
import {Constants} from './Constants';

export class Command {

  constructor() {
    this.baseCommand = this.createVltBase();
    this.options = [];
    this.cmd = "";
    this.args = [];
    this.auth = false;
  }

  enableAuth() {
    this.auth = true;
  }

  option(option) {
    if ( option !== null &&
            option !== undefined) {
      this.options.push(option);
    }
  }

  arg(arg) {
    if ( arg !== null &&
              arg !== undefined ) {
      this.args.push(arg);
    }
  }

  build() {
    if ( this.auth ) {
      this.prepareAuth();
    }

    let fullCommand = "";
    if ( CONTEXT.platform == Constants.PLATFORM_WIN ) {
      let drive = CONTEXT.contentPath.substring(0, CONTEXT.contentPath.indexOf(":"));
      fullCommand = "cd /"+ drive + " " + CONTEXT.contentPath + " && ";
    } else {
      fullCommand = "cd "+ CONTEXT.contentPath + " && ";
    }

    fullCommand = fullCommand + this.baseCommand;
    if ( this.options.length > 0 ) {
      this.options.forEach(function( option ) {
        fullCommand = fullCommand + " " + option;
      });
    }
    fullCommand = fullCommand + " " + this.cmd;
    if ( CONTEXT.isCheckout ) {
      fullCommand = fullCommand + " " + this.prepareServerUrl();
    }
    if ( this.args.length > 0 ) {
      this.args.forEach(function( arg ) {
        fullCommand = fullCommand + " " + arg;
      });
    }
    return fullCommand;
  }

  prepareAuth() {
    this.option(
      "--credentials " +
      atom.config.get(Constants.CONFIG_USERNAME, '') +":" +
      atom.config.get(Constants.CONFIG_PASSWORD, '')
     );
  }

  prepareServerUrl = () => {
    let fullUrl = "http://";
    fullUrl = fullUrl + atom.config.get( Constants.CONFIG_HOST );
    if (
      atom.config.get( Constants.CONFIG_PORT ) != undefined  &&
      atom.config.get( Constants.CONFIG_PORT ) > 0
    ) {
      fullUrl = fullUrl + ":" + atom.config.get( Constants.CONFIG_PORT );
    }

    fullUrl = fullUrl + Constants.SERVER_ROOT;
    return fullUrl;
  }

  createVltBase() {
    if ( atom.config.get(Constants.CONFIG_VLTBASE, '').endsWith( CONTEXT.pathSeparator ) ) {
      return atom.config.get(Constants.CONFIG_VLTBASE, '') + "bin" + CONTEXT.pathSeparator + "vlt";
    } else {
      return atom.config.get(Constants.CONFIG_VLTBASE, '') +
          CONTEXT.pathSeparator + "bin" + CONTEXT.pathSeparator + "vlt";
    }
  }

}

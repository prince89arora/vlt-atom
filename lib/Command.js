'use babel';

import { CompositeDisposable } from 'atom';
import {CONTEXT} from './Context';
import {Constants} from './Constants';
import { PayLoad } from './PayLoad';

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

  addPayLoad( path, isCheckout ) {
    this.payLoad = new PayLoad();
    this.payLoad.initPayloadContext( path );
    this.payLoad.isCheckout = isCheckout;
  }

  addContentPath( path ) {
    this.contentPath = path;
  }

  build() {
    let cPath = this.contentPath;
    if ( cPath == undefined ) {
      cPath = this.payLoad.contentPath;
    }

    let fullCommand = "";
    if ( CONTEXT.platform == Constants.PLATFORM_WIN ) {
      fullCommand = "cd /d " + cPath + " && ";
    } else {
      fullCommand = "cd "+ cPath + " && ";
    }

    fullCommand = fullCommand + this.baseCommand;
    if ( this.auth ) {
      fullCommand = fullCommand + " --credentials " + atom.config.get(Constants.CONFIG_USERNAME, '') +":" +
          atom.config.get(Constants.CONFIG_PASSWORD, '') + " ";
    }
    if ( this.options.length > 0 ) {
      this.options.forEach(function( option ) {
        fullCommand = fullCommand + " " + option;
      });
    }
    fullCommand = fullCommand + " " + this.cmd;
    if ( this.payLoad != undefined && this.payLoad.isCheckout ) {
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
      return atom.config.get(Constants.CONFIG_VLTBASE, '') + "bin" + CONTEXT.pathSeparator + "vlt -v";
    } else {
      return atom.config.get(Constants.CONFIG_VLTBASE, '') +
          CONTEXT.pathSeparator + "bin" + CONTEXT.pathSeparator + "vlt -v";
    }
  }

}

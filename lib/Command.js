'use babel';

import { CompositeDisposable } from 'atom';
import {CONTEXT} from './Context';

export class Command {

  constructor() {
    this.baseCommand = "vlt";
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
    // if ( CONTEXT.isCheckout ) {
    //
    // } else {
    //   fullCommand = "cd "+ CONTEXT.basePath + " && ";
    // }
    fullCommand = "cd "+ CONTEXT.contentPath + " && ";

    fullCommand = fullCommand + this.baseCommand;
    if ( this.options.length > 0 ) {
      this.options.forEach(function( option ) {
        fullCommand = fullCommand + " " + option;
      });
    }

    //fullCommand = fullCommand + " -v ";

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
      atom.config.get('vlt-atom.username', '') +":" +
      atom.config.get('vlt-atom.password', '')
     );
  }

  prepareServerUrl = () => {
    let fullUrl = "http://";
    fullUrl = fullUrl + atom.config.get( 'vlt-atom.crxHost' );
    if (
      atom.config.get( 'vlt-atom.crxPort' ) != undefined  &&
      atom.config.get( 'vlt-atom.crxPort' ) > 0
    ) {
      fullUrl = fullUrl + ":" + atom.config.get( 'vlt-atom.crxPort' );
    }

    fullUrl = fullUrl + "/crx/-/jcr:root";
    return fullUrl;
  }

}

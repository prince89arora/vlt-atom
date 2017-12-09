'use babel';

import { File } from 'atom';
import { CompositeDisposable } from 'atom';
import Utils from './Utils';
import { Command } from './Command';
import {ModuleMessage} from './ModuleMessage';
import {Executor} from './Executor';
import {CONTEXT} from './Context';
import {Constants} from './Constants';


export default class CrxService {

  constructor() {
    this.utils = new Utils();
    this.executor = new Executor();
  }

  checkout() {
    let checkoutCommand = new Command();
    checkoutCommand.cmd = "co --filter "+ this.getFilterPath();
    checkoutCommand.arg( ". --force" );
    checkoutCommand.enableAuth();
    let checkoutCmd = checkoutCommand.build();

    this.executor.execute(
        checkoutCmd,
        ModuleMessage.CHECKOUT_SUCCESS,
        ""
     );
  }

 //Pull changes for selected file or directory from crx.
  pullFromCrx(path, silent) {
    if ( !this.validatePath( path ) ) {
      atom.notifications.addError(
        ModuleMessage.ERROR_INVALID_PATH,
        {
          dismissable : true
        });
        return;
    }

    this.utils.prepareContext( path );
    CONTEXT.cmdType = "pull";

    const statusPromise = this.validateCheckout();

    statusPromise.
      then( ( status ) => {
          if ( status ) {
            CONTEXT.isCheckout = false;
            let cmd = new Command();
            cmd.cmd = "up";
            cmd.arg( "." + CONTEXT.pathSeparator + Constants.DIR_JCRROOT + CONTEXT.payloadPath );
            cmd.arg( " --force" );
            cmd.jcrRootPath = CONTEXT.jcrRootPath;

            let fullCommand = cmd.build();

            this.executor.execute(fullCommand, ModuleMessage.PULL_SUCCESS, ModuleMessage.PULL_FAILED, silent);
          } else {
            //atom.notifications.addInfo(ModuleMessage.CHECKOUT_PROCESS, {});
            CONTEXT.isCheckout = true;
            this.checkout();
          }
      });
  }

//Push selected file or directory to crx.
  pushToCrx(path, silent) {
    if ( !this.validatePath( path ) ) {
      atom.notifications.addError(
        ModuleMessage.ERROR_INVALID_PATH,
        {
          dismissable : true
        });
        return;
    }

    this.utils.prepareContext( path );
    CONTEXT.cmdType = "push";

    const statusPromise = this.validateCheckout();

    statusPromise.
      then( ( status ) => {
          if ( status ) {
            CONTEXT.isCheckout = false;

                this.executor.executePush(
                    "." + CONTEXT.pathSeparator + Constants.DIR_JCRROOT + CONTEXT.payloadPath,
                    silent
                 );
          } else {
            //atom.notifications.addInfo(ModuleMessage.CHECKOUT_PROCESS, {});
            CONTEXT.isCheckout = true;
            this.checkout();
          }
      });
  }

 //Add a file or directory under vlt control.
  addUnderVlt( path, silent ) {
    this.utils.prepareContext( path );
    CONTEXT.cmdType = "add";

    let command = new Command();
    command.cmd = "add -v";

    const statusPromise = this.validateCheckout();

    statusPromise.
      then( ( status ) => {
          if ( status ) {
            CONTEXT.isCheckout = false;
            command.arg( "." + CONTEXT.pathSeparator + Constants.DIR_JCRROOT + CONTEXT.payloadPath );
            let fullCommand = command.build();

            this.executor.execute(fullCommand, ModuleMessage.ADD_SUCCESS, ModuleMessage.ADD_FAILED, silent);
          } else {
            CONTEXT.isCheckout = true;
            this.checkout();
          }
      });
  }

  validatePath(path) {
    if ( atom.project.contains(path) ) {
      if ( path.indexOf(Constants.DIR_JCRROOT) > -1) {
         return true;
      }
    }
    return false;
  }


  validateCheckout() {
    let vltPath = CONTEXT.jcrRootPath;
    if ( CONTEXT.jcrRootPath.endsWith( CONTEXT.pathSeparator ) ) {
      vltPath = vltPath + ".vlt";
    } else {
      vltPath = vltPath + CONTEXT.pathSeparator + ".vlt";
    }
    let vltConfigFile = new File( vltPath, false );
    return vltConfigFile.exists();
  }

  getFilterPath() {
    return CONTEXT.contentPath + CONTEXT.pathSeparator +
            Constants.DIR_META + CONTEXT.pathSeparator + Constants.DIR_VAULT +
                 CONTEXT.pathSeparator + Constants.FILENAME_FILTER;
  }


}

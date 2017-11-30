'use babel';

import { File } from 'atom';
import { Directory } from 'atom';
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

  pullFromCrx(path) {
    if ( !this.validatePath( path ) ) {
      atom.notifications.addError(
        ModuleMessage.ERROR_INVALID_PATH,
        {
          dismissable : true
        });
        return;
    }

    CONTEXT.fullPath = path;
    CONTEXT.jcrRootPath = this.utils.getRootPath(path);
    CONTEXT.payloadPath = this.utils.getCrxPath(path);
    CONTEXT.contentPath = this.utils.getContentPath(path);
    CONTEXT.cmdType = "pull";

    const statusPromise = this.validateCheckout();

    statusPromise.
      then( ( status ) => {
          if ( status ) {
            CONTEXT.isCheckout = false;
            let cmd = new Command();
            cmd.cmd = "up";
            cmd.arg( "." + CONTEXT.pathSeparator + Constants.DIR_JCRROOT + CONTEXT.payloadPath );
            cmd.jcrRootPath = CONTEXT.jcrRootPath;

            let fullCommand = cmd.build();

            this.executor.execute(fullCommand, ModuleMessage.PULL_SUCCESS, ModuleMessage.PULL_FAILED);
          } else {
            atom.notifications.addInfo(ModuleMessage.CHECKOUT_PROCESS, {});
            CONTEXT.isCheckout = true;
            this.checkout();
          }
      });
  }

  pushToCrx(path) {
    if ( !this.validatePath( path ) ) {
      atom.notifications.addError(
        ModuleMessage.ERROR_INVALID_PATH,
        {
          dismissable : true
        });
        return;
    }

    CONTEXT.fullPath = path;
    CONTEXT.jcrRootPath = this.utils.getRootPath(path);
    CONTEXT.payloadPath = this.utils.getCrxPath(path);
    CONTEXT.contentPath = this.utils.getContentPath(path);
    CONTEXT.cmdType = "push";

    const statusPromise = this.validateCheckout();

    statusPromise.
      then( ( status ) => {
          if ( status ) {
            CONTEXT.isCheckout = false;
            let cmd = new Command();
            cmd.cmd = "ci";
            cmd.arg( "." + CONTEXT.pathSeparator + Constants.DIR_JCRROOT + CONTEXT.payloadPath );
            cmd.jcrRootPath = CONTEXT.jcrRootPath;

            let fullCommand = cmd.build();

            this.executor.execute(fullCommand,
                ModuleMessage.PUSH_SUCCESS,
                ModuleMessage.PUSH_FAILED);
          } else {
            atom.notifications.addInfo(ModuleMessage.CHECKOUT_PROCESS, {});
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

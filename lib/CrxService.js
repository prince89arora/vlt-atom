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
    checkoutCommand.cmd = "co --filter ./META-INF/vault/filter.xml";
    checkoutCommand.arg( ". --force" );
    let checkoutCmd = checkoutCommand.build();

    this.executor.execute(
        checkoutCmd,
        ModuleMessage.CHECKOUT_SUCCESS,
        ""
     );
  }

  pullFromCrx(path) {
    console.log("inside pull");
    if ( !this.validatePath( path ) ) {
      atom.notifications.addError(
        ModuleMessage.ERROR_INVALID_PATH,
        {});
        return;
    }

    CONTEXT.fullPath = path;
    CONTEXT.jcrRootPath = this.utils.getRootPath(path);
    CONTEXT.payloadPath = this.utils.getCrxPath(path);
    CONTEXT.contentPath = this.utils.getContentPath(path);
    CONTEXT.cmdType = "pull";

    console.log(CONTEXT);

    const statusPromise = this.validateCheckout();

    statusPromise.
      then( ( status ) => {
          if ( status ) {
            CONTEXT.isCheckout = false;
            let cmd = new Command();
            cmd.cmd = "up";
            cmd.arg( "./jcr_root" + CONTEXT.payloadPath );
            cmd.jcrRootPath = CONTEXT.jcrRootPath;
            console.log(cmd);

            let fullCommand = cmd.build();
            console.log(fullCommand);

            this.executor.execute(fullCommand, ModuleMessage.PULL_SUCCESS, ModuleMessage.PULL_FAILED);
          } else {
            atom.notifications.addInfo(ModuleMessage.CHECKOUT_PROCESS, {});
            CONTEXT.isCheckout = true;
            this.checkout();
          }
      });
  }

  // pushToCrx(path) {
  //   if ( !this.validatePath( path ) ) {
  //     atom.notifications.addError(
  //       ModuleMessage.ERROR_INVALID_PATH_PUSH,
  //       {});
  //       return;
  //   }
  //
  //   CONTEXT.fullPath = path;
  //   CONTEXT.jcrRootPath = this.utils.getRootPath(path);
  //   CONTEXT.payloadPath = this.utils.getCrxPath(path);
  //   this.backupFiles(path);
  //
  //   let cmd = new Command();
  //   cmd.cmd = "import";
  //   cmd.arg( "." )
  //   cmd.arg( CONTEXT.payloadPath );
  //   cmd.jcrRootPath = CONTEXT.jcrRootPath;
  //   console.log(cmd);
  //
  //   let fullCommand = cmd.build();
  //   console.log(fullCommand);
  //
  //   this.executor.execute(fullCommand, ModuleMessage.PUSH_SUCCESS, ModuleMessage.PUSH_FAILED);
  // }

  validatePath(path) {
    if ( atom.project.contains(path) ) {
      if ( path.indexOf("jcr_root") > -1) {
         return true;
      }
    }
    return false;
  }


  validateCheckout() {
    let vltPath = CONTEXT.jcrRootPath;
    if ( CONTEXT.jcrRootPath.endsWith("/") ) {
      vltPath = vltPath + ".vlt";
    } else {
      vltPath = vltPath + "/.vlt";
    }
    console.log(vltPath);
    let vltConfigFile = new File( vltPath, false );
    return vltConfigFile.exists();
  }


}

'use babel';

import { File } from 'atom';
import { CompositeDisposable } from 'atom';
import { Command } from './Command';
import {ModuleMessage} from './ModuleMessage';
import {CONTEXT} from './Context';
import {Constants} from './Constants';

let crxService = {

  //
  checkout : function( path ) {
    let checkoutCommand = new Command();
    checkoutCommand.addPayLoad( path, true );
    checkoutCommand.cmd = "co --filter "+ getFilterPath();
    checkoutCommand.arg( ". --force" );
    checkoutCommand.enableAuth();

    CONTEXT.executor.execute(
        checkoutCommand,
        ModuleMessage.CHECKOUT_SUCCESS,
        ""
     );
  },

  //
  pullFromCrx : function( path, silent ) {
    if ( !validatePath( path ) ) {
      atom.notifications.addError(
        ModuleMessage.ERROR_INVALID_PATH,
        {
          dismissable : true
        });
        return;
    }

    let cmd = new Command();
    cmd.addPayLoad( path, false );

    const statusPromise = validateCheckout( cmd.payLoad.jcrRootPath );
    statusPromise.
      then( ( status ) => {
          if ( status ) {

            cmd.payLoad.cmdType = "pull";
            cmd.cmd = "up";
            cmd.arg( cmd.payLoad.payloadPath );
            cmd.arg( " --force" );

            CONTEXT.executor.execute(cmd, ModuleMessage.PULL_SUCCESS, ModuleMessage.PULL_FAILED, silent);
          } else {
            //atom.notifications.addInfo(ModuleMessage.CHECKOUT_PROCESS, {});
            this.checkout( path );
          }
      });
  },

  //
  pushToCrx : function( path, silent ) {
    if ( !validatePath( path ) ) {
      atom.notifications.addError(
        ModuleMessage.ERROR_INVALID_PATH,
        {
          dismissable : true
        });
        return;
    }

    const statusPromise = validateCheckout(
      CONTEXT.utils.getRootPath( path )
    );

    statusPromise.
      then( ( status ) => {
          if ( status ) {
                CONTEXT.executor.executePush(
                    path,
                    silent
                 );
          } else {
            //atom.notifications.addInfo(ModuleMessage.CHECKOUT_PROCESS, {});
            this.checkout();
          }
      });
  },

  //
  addUnderVlt( path, silent ) {
    let command = new Command();
    command.cmd = "add -v";
    command.addPayLoad( path, false );
    command.payLoad.cmdType = "add";

    const statusPromise = validateCheckout(
      command.payLoad.jcrRootPath  
    );
    statusPromise.
      then( ( status ) => {
          if ( status ) {
            command.arg( command.payLoad.payloadPath );
            CONTEXT.executor.execute(command, ModuleMessage.ADD_SUCCESS, ModuleMessage.ADD_FAILED, silent);
          } else {
            this.checkout( path );
          }
      });
  }



}

//
//
function validatePath(path) {
  if ( atom.project.contains(path) ) {
    if ( path.indexOf(Constants.DIR_JCRROOT) > -1) {
       return true;
    }
  }
  return false;
}

//
//
function validateCheckout( jcrPath ) {
  let vltPath = jcrPath;
  if ( jcrPath.endsWith( CONTEXT.pathSeparator ) ) {
    vltPath = vltPath + ".vlt";
  } else {
    vltPath = vltPath + CONTEXT.pathSeparator + ".vlt";
  }
  let vltConfigFile = new File( vltPath, false );
  return vltConfigFile.exists();
}

//
//
function getFilterPath() {
  return CONTEXT.contentPath + CONTEXT.pathSeparator +
          Constants.DIR_META + CONTEXT.pathSeparator + Constants.DIR_VAULT +
               CONTEXT.pathSeparator + Constants.FILENAME_FILTER;
}


export { crxService };

'use babel';

import { File } from 'atom';
import { CompositeDisposable } from 'atom';
import { exec } from 'child_process';
import Utils from './Utils';
import {CONTEXT} from './Context';
import {ModuleMessage} from './ModuleMessage';
import CrxService from './CrxService';

export class Executor {

  constructor() {
    this.utils = new Utils();
  }

  execute( command , successMessage, errorMessage, silent){
    if ( !silent ) {
      atom.notifications.addInfo(
        ModuleMessage.INFO_EXEC_INIT, {});
    }
    exec(
      command,
      (err, stdout, stderr) => {
        let error = "";
        let stdOut = "";
        let stdError = "";
        if ( err ) {
          console.log("[error] : "+ err);
          error = err;
        }

        if ( stdout ) {
          console.log(stdout);
          stdOut = stdout;
        }

        if ( stderr ) {
          console.log("[stderror] : " + stderr);
          stdError = stderr;
        }

        if ( stdOut.indexOf("[ERROR]") != -1) {
          error = error + stdOut;
        }

        if ( error != "" ) {
          if ( !silent ) {
            atom.notifications.addError(errorMessage, {
              dismissable : true,
              detail : stdOut + error
            });
          }
        } else {

          if ( CONTEXT.isCheckout ) {
            if ( !silent ) {
              atom.notifications.addSuccess( ModuleMessage.CHECKOUT_SUCCESS , {});
            }

            switch (CONTEXT.cmdType) {
              case "pull":
                CONTEXT.crxService.pullFromCrx( CONTEXT.fullPath );
                break;

              case "push":
                CONTEXT.crxService.pushToCrx( CONTEXT.fullPath );
                break;

              default:
                console.error("Invalid command type..");
            }
          } else {
            if ( !silent ) {
              atom.notifications.addSuccess(
                successMessage, {
                  dismissable : true,
                  detail : stdOut
                });  
            }
          }
        }

        // this.utils.writeFile( CONTEXT.filterFile, CONTEXT.filterContent );

    });
  }



}

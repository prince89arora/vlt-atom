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

  execute( command , successMessage, errorMessage){
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
          atom.notifications.addError(stdOut + error, {});
        } else {

          if ( CONTEXT.isCheckout ) {
            atom.notifications.addSuccess( ModuleMessage.CHECKOUT_SUCCESS , {});
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
            atom.notifications.addSuccess(
              stdOut, {});
          }
        }

        // this.utils.writeFile( CONTEXT.filterFile, CONTEXT.filterContent );

    });
  }



}
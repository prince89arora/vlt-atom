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
            switch (CONTEXT.cmdType) {
              case "pull":
              console.log("sending back to pull...");
                CONTEXT.crxService.pullFromCrx( CONTEXT.fullPath );
                break;

              case "push":
                CONTEXT.crxService.pushToCrx( CONTEXT.basePath );
                break;

              default:
                console.error("Invalid command type..");
            }
          } else {
            let message = stdOut;
            atom.notifications.addSuccess(
              message, {});
          }
        }

        // this.utils.writeFile( CONTEXT.filterFile, CONTEXT.filterContent );

    });
  }



}

'use babel';

import { File } from 'atom';
import { CompositeDisposable } from 'atom';
import { exec } from 'child_process';
import Utils from './Utils';
import {CONTEXT} from './Context';
import {ModuleMessage} from './ModuleMessage';
import CrxService from './CrxService';
import { Command } from './Command';
import {Constants} from './Constants';

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

  executePush( path, silent ) {
    let that = this;
    let statusCommand = new Command();
    statusCommand.cmd = "status";
    statusCommand.arg( "-v" );
    statusCommand.arg( path );

    exec( statusCommand.build(),
      (err, stdout, stderr) => {
        let error = "";
        let status = "";
        if ( err ) {
          console.log(err);
          error = err;
        }

        if ( stdout ) {
          console.log(stdout);
          status = stdout;
        }

        if ( status !== "" ) {
          let statsList = status.split("\n");
          let statsPromise = that.checkStatusList( statsList );
          console.log(statsPromise);
          statsPromise.then((value) => {
            console.log(value);

            let cmd = new Command();
            cmd.cmd = "ci";
            cmd.arg( path );
            cmd.arg( " --force" );
            cmd.jcrRootPath = CONTEXT.jcrRootPath;

            let fullCommand = cmd.build();
            that.execute(fullCommand,
                ModuleMessage.PUSH_SUCCESS,
                ModuleMessage.PUSH_FAILED,
                silent);
          }).catch((err) => {
            console.log(err);
          });

        }
    });
  }

  checkStatusList( statusList ) {
    let that = this;
    return new Promise(function(resolve, reject) {

      try {
        statusList.forEach((item) => {
          if ( item != "" ) {
            that.getFileStatus( item );
          }
        });
        resolve("completed");
      } catch(err) {
        reject("could not complets status check");
      }

    });
  }

  getFileStatus( status ) {
    let eventType = status.substring( 0, 1 );
    let filePath = status.substring( status.indexOf(" "), status.length );
    switch ( eventType ) {
      case "?":
          console.log(filePath + " is new ..");
          this.addItemInVlt( filePath );
        break;
      case "!":
          console.log(filePath + " is deleted .. ");
          this.removeItemFromVlt( filePath );
          break;
      default:
        console.log("eventType => "+ eventType);
    }
  }

  addItemInVlt( filePath ) {
    let addCommand = new Command();
    addCommand.cmd = "add";
    addCommand.arg( filePath );
    exec( addCommand.build(),
      (err, stdOut, stdErr) => {
        if( err ) {
          console.log(err);
        }

        if ( stdOut ) {
          console.log(stdOut);
        }
    });
  }

  removeItemFromVlt( filePath ) {
    let addCommand = new Command();
    addCommand.cmd = "delete";
    addCommand.arg( filePath );
    exec( addCommand.build(),
      (err, stdOut, stdErr) => {
        if( err ) {
          console.log(err);
        }

        if ( stdOut ) {
          console.log(stdOut);
        }
    });
  }


}

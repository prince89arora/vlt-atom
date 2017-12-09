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

              case "add":
                CONTEXT.crxService.addUnderVlt( CONTEXT.fullPath );
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
          error = err;
        }

        if ( stdout ) {
          status = stdout;
        }

        if ( status !== "" ) {
          let statsList = status.split("\n");
          let statsPromises = that.checkStatusList( statsList );

          //check all status promises and commit changes
          //to crx server.
          Promise.all( statsPromises ).then((value) => {
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
            console.error("Error while processing vlt status files for push : " + err);
          });

        }
    });
  }

//checking all files status and preparing list of statsPromises
//will contains promises for commands to be executed to added
//or remove any file.
  checkStatusList( statusList ) {
    let that = this;
    let promises = [];

    try {
      statusList.forEach((item) => {
        if ( item != "" ) {
          let promise = that.getFileStatus( item );
          if ( promise !== null ) {
              promises.push( promise );
          }
        }
      });
    } catch(err) {
      console.error("could not complets status check => " + err);
    }
    return promises;
  }

//checking status for single file available in vlt status.
  getFileStatus( status ) {
    let eventType = status.substring( 0, 1 );
    let filePath = status.substring( status.indexOf(" ") + 1, status.length );

    let command = new Command();
    switch ( eventType ) {
      case "?":
          command.cmd = "add -v";
        break;
      case "!":
          command.cmd = "delete -v";
          break;
      default:
        command.cmd = "";
    }

    if ( command.cmd !== "" ) {
        command.arg( filePath );
        return this.promiseCommand( command );
    } else {
      return null;
    }

  }

  //Execute command with promise.
  promiseCommand( command ) {
    return new Promise(function(resolve, reject) {
      exec( command.build(),
        (err, stdOut, stdErr) => {
          if( err ) {
            console.error(err);
            reject(err);
          }

          if ( stdOut ) {
            resolve(stdOut);
          }
      });
    });
  }

}

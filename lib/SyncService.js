'use babel'

import fs from 'fs';
import Path from 'path';
import { CompositeDisposable } from 'atom';
import {Constants} from './Constants';
import {CONTEXT} from './Context';
import CrxService from './CrxService';

var DIR_AVOID = [
  ".git",
  ".idea",
  ".settings",
  "META-INF"
];

var FILE_AVOID = [
  ".vlt"
];

var WATCHERS = [];

function addWatchers() {
  let directories = atom.project.getDirectories();
  directories.forEach(( element ) => {
    initWatcher( element.path );
  }, this);
}

function initWatcher( projectPath ) {
  let service = this;
  fs.readdir( projectPath, function( err, files ) {
    if ( err ) {
      console.error( err );
      process.exit(1);
    }

    files.forEach(( item ) => {
      if ( DIR_AVOID.indexOf( item ) == -1 ) {
        //creating full path to current file item.
        let fullPath = Path.join( projectPath, item );
        //stats for file to check is directory or is file.
        fs.stat( fullPath, function( error, stat ) {
              if ( stat.isDirectory() && item == Constants.DIR_JCRROOT ) {
                startWatcher( fullPath );
              } else if (stat.isDirectory()) {
                //Recursively checking insite current directory.
                initWatcher( fullPath );
              }
        });
      }
    }, this);
  });
}

function startWatcher( rootPath ) {
  fs.readdir( rootPath, function( err, files ) {
    if ( err ) {
      console.error( err );
      process.exit(1);
    }
    //Processing each directory for watcher.
    files.forEach(( item ) => {

        if ( DIR_AVOID.indexOf( item ) == -1 ) {
          //creating full path to current file item.
          let fullPath = Path.join( rootPath, item );

          //stats for file to check is directory or is file.
          fs.stat( fullPath, function( error, stat ) {
                if ( error ) {
                  console.error( error );
                }

                //Add watcher if this is a directory.
                if ( stat.isDirectory() ) {
                  let watcher = fs.watch( fullPath , (eventType, filename) => {
                    if ( filename ) {
                      if ( FILE_AVOID.indexOf( filename ) == -1 && !isInvalidFile(filename)) {
                        let filePath = Path.join( fullPath, filename );
                        if ( CONTEXT.crxSerivce === undefined) {
                          CONTEXT.crxService = new CrxService();
                        }
                        CONTEXT.crxService.pushToCrx( filePath, true );
                      }
                    }
                  });
                  WATCHERS.push( watcher );
                  //Search for more directories inside current directory.
                  startWatcher( fullPath );
                }
          });
        }

    }, this);
  });
}

function isInvalidFile( filename ) {
  return (filename.endsWith( ".tmp" ));
}

function removeWatchers() {
  return new Promise((resolve, reject) => {
    WATCHERS.forEach((item) => {
      try {
        item.close();
      } catch( err ) {
        console.log(err);
      }
    });
  });
}

export {
  addWatchers,
  removeWatchers
};

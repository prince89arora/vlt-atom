'use babel'

/**
 * manage watchers for project directories. Service to auto sync changes from
 * local working directory to crx remote server.
 *
 * @author prince89arora
 */
import fs from 'fs';
import Path from 'path';
import {CompositeDisposable} from 'atom';
import {Constants} from './Constants';
import {VltService} from "./service/vlt.service";
import {PayloadModel} from "./model/payload.model";
import {messenger} from "./utils/messenger";
import {ModuleMessage} from "./ModuleMessage";

var DIR_AVOID = [
    ".git",
    ".idea",
    ".settings",
    "META-INF"
];

var FILE_AVOID = [
    ".vlt",
    ".gitignore"
];

var WATCHERS = [];

var watcher_notification;

/**
 * initialise validating all the projects added.
 */
function addWatchers() {
    let directories = atom.project.getDirectories();
    directories.forEach((element) => {
        initWatcher(element.path);
    }, this);
}

/**
 * Evaluate directories under project and initiate watcher process.
 *
 * @param projectPath
 */
function initWatcher(projectPath) {
    fs.readdir(projectPath, function (err, files) {
        if (err) {
            console.error(err);
            watcher_notification.dismiss();

            messenger.error(
                ModuleMessage.WATCHER_ERROR,
                true,
                err
            );

            process.exit(1);
        }

        files.forEach((item) => {
            if (DIR_AVOID.indexOf(item) == -1) {
                //creating full path to current file item.
                let fullPath = Path.join(projectPath, item);

                //stats for file to check is directory or is file.
                fs.stat(fullPath, function (error, stat) {
                    if (stat.isDirectory() && item == Constants.DIR_JCRROOT) {
                        if ( watcher_notification == undefined ) {
                            watcher_notification = messenger.info(ModuleMessage.WATCHER_INFO, true);
                        }

                        startWatcher(fullPath);
                    } else if (stat.isDirectory()) {
                        //Recursively checking insite current directory.
                        initWatcher(fullPath);
                    }
                });
            }
        }, this);
    });
}

/**
 * start watchers added for root directory.
 *
 * @param rootPath
 */
function startWatcher(rootPath) {
    fs.readdir(rootPath, function (err, files) {
        if (err) {
            console.error(err);
            watcher_notification.dismiss();
            messenger.error(
                ModuleMessage.WATCHER_ERROR,
                true,
                err
            );
            process.exit(1);
        }
        //Processing each directory for watcher.
        files.forEach((item) => {

            if (DIR_AVOID.indexOf(item) == -1) {
                //creating full path to current file item.
                let fullPath = Path.join(rootPath, item);

                //stats for file to check is directory or is file.
                fs.stat(fullPath, function (error, stat) {
                    if (error) {
                        console.error(error);
                    }

                    //Add watcher if this is a directory.
                    if (stat.isDirectory()) {
                        let watcher = fs.watch(fullPath, (eventType, filename) => {

                            if (filename) {
                                if (FILE_AVOID.indexOf(filename) == -1 && !isInvalidFile(filename)) {
                                    let filePath = Path.join(fullPath, filename);

                                    setTimeout(function () {
                                        VltService.push(new PayloadModel(filePath), true);
                                    }, 2000);

                                }
                            }

                        });
                        WATCHERS.push(watcher);
                        //Search for more directories inside current directory.
                        startWatcher(fullPath);
                    }
                });
            }

        }, this);

        watcher_notification.dismiss();
    });
}

function isInvalidFile(filename) {
    return (filename.endsWith(".tmp"));
}

async function removeWatchers() {

    WATCHERS.forEach((item) => {
        try {
            item.close();
        } catch (err) {
            console.log(err);
        }
    });

}

export {
    addWatchers,
    removeWatchers
};

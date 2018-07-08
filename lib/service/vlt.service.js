'use babel'
/**
 * Vlt Service to manage vlt commands
 *
 * - checkout
 * - push
 * - pull
 * - add
 * - status
 *
 * command can be executed in silent mode or with notifications to user
 * every command accepts a payload to act on and silent flag to manage
 * notifications.
 *
 *
 * @author prince89arora
 */

import { File } from 'atom';
import { CONTEXT } from "../Context";
import {Constants} from "../Constants";
import {executor} from "./executor";
import {messenger} from "../utils/messenger";
import {ModuleMessage} from "../ModuleMessage";
import {FileStatus} from "../model/filestatus.model";
import {STATE} from "../utils/filestate";
import {PayloadModel} from "../model/payload.model";

/**
 * Check status for checkout from current jcr root from file system.
 *
 * @param jcr_root
 * @returns {*}
 */
function validate_checkout( jcr_root ) {
    let check_promise = undefined;

    // validate if checkout validation is already done for given jcr path
    if ( CONTEXT.checkout_map.indexOf( jcr_root ) == -1) {
        // access file system to validate checkout state if not done already.
        let vltPath = jcr_root;
        if ( jcr_root.endsWith( CONTEXT.pathSeparator ) ) {
            vltPath = vltPath + ".vlt";
        } else {
            vltPath = vltPath + CONTEXT.pathSeparator + ".vlt";
        }
        let vltConfigFile = new File( vltPath, false );
        check_promise = vltConfigFile.exists();
    } else {
        // response with a promise if checkout validation is already done.
        check_promise = new Promise(
            resolve => {
                return true
            }
        );
    }

    return check_promise;
}

/**
 * prepare command for given action payload and also include arguments.
 *
 * @param payload
 * @param action
 * @param arguments
 * @returns {string}
 */
function prepare_command( payload, action, arguments ) {
    let command = "";

    // entering in payload content directory.
    if ( CONTEXT.platform == Constants.PLATFORM_WIN ) {
        command = `cd /d ${payload.content_root} && ${CONTEXT.vlt_base} `;
    } else {
        command = `cd ${payload.content_root} && ${CONTEXT.vlt_base} `;
    }

    // adding credentials, action and arguments
    command = `${command} --credentials ${atom.config.get(Constants.CONFIG_USERNAME, '')}:${atom.config.get(Constants.CONFIG_PASSWORD, '')} ${action} ${arguments}`;
    return command;
}

/**
 * preparing crx server url based on plugin settings
 *
 * @returns {string|string}
 */
function prepare_serverurl() {
    let fullUrl = "http://";
    fullUrl = fullUrl + atom.config.get( Constants.CONFIG_HOST );
    if (
        atom.config.get( Constants.CONFIG_PORT ) != undefined  &&
        atom.config.get( Constants.CONFIG_PORT ) > 0
    ) {
        fullUrl = fullUrl + ":" + atom.config.get( Constants.CONFIG_PORT );
    }

    fullUrl = fullUrl + Constants.SERVER_ROOT;
    return fullUrl;
}

/**
 * add mapped jcr root path in map to manage checkout status.
 *
 * @param jcr_root
 * @returns {Promise<void>}
 */
async function addMappedJcrRoot( jcr_root ) {
    if ( CONTEXT.checkout_map.indexOf(jcr_root) == -1 ) {
        CONTEXT.checkout_map.push(jcr_root);
    }
}

/**
 * validate std out returned from command and check status.
 * if error found then display based detail message to user. And in case of success
 * display success message.
 *
 * @param success_message
 * @param error_message
 * @param stdOut
 */
function handle_result( success_message, error_message, stdOut, silent, detailed_info ) {
    if ( stdOut.indexOf("[ERROR]") != -1 ) {
        messenger.error(error_message, true, stdOut);
    } else {
        if ( !silent ) {
            if ( detailed_info != undefined ) {
                messenger.success( success_message, true, detailed_info );
            } else {
                messenger.success( success_message, false );
            }
        }
    }
}

var VltService = {

    /**
     * Checkout content from crx to local working copy.
     * will add notifications if silent mode is not enabled
     *
     * @param payload
     * @param silent
     */
    async checkout(payload, silent) {
        // preparing command for checkout action
        let checkoutCommand = prepare_command(payload, 'co', ` ${prepare_serverurl()} --filter ${payload.filter_file_path} . --force`);
        let result;
        await executor.run( checkoutCommand )
            .then( stdout => {
                handle_result( ModuleMessage.CHECKOUT_SUCCESS, ModuleMessage.CHECKOUT_ERROR, stdout, silent );
                result = true;
                addMappedJcrRoot( payload.jcr_root );
            })
            .catch( error => {
                result = false;
                messenger.error(
                    ModuleMessage.CHECKOUT_ERROR,
                    true,
                    error
                );
            });
        return result;
    },

    /**
     * push all changes from working copy to remote crx server.
     * evaluate all change under payload and commit changes based on their state.
     *
     * @param payload
     * @param silent
     */
    push(payload, silent) {
        /**
         * push action to be performed is checkout status is true.
         *
         * @type {any}
         */
        let pushOperation = async function( payload, silent ) {
            // adding payload path in files_inProgress list to track inprogress files.
            this.addInProgress(payload.path);
            let status_notification;
            if ( !silent ) {
                status_notification = messenger.info( ModuleMessage.STATS_CHECK, true );
            }

            // check status for all files and filders under payload.
            this.status( payload )
                .then( (statusList) => {
                    // display notification if no changes found under payload.
                    if ( statusList.length == 0 ) {
                        if ( !silent ) {
                            status_notification.dismiss();
                            messenger.info( ModuleMessage.STATS_NO_CHANGE, false );
                            this.removeInProgress(payload.path);
                        }
                        return;
                    };
                    // if changes found under payload then prepare promise for new and deleted files
                    // under payload. Prepare promises for new and deleted files based on their state
                    // this will add/ delete files under control of vlt.
                    let promises = [];
                    statusList.forEach(
                        ( fileStatus ) => {
                            let filePayload;
                            switch ( fileStatus.status ) {
                                case STATE.NEW:
                                    filePayload = new PayloadModel( `${payload.content_root}${fileStatus.path}` );

                                    promises.push(
                                        executor.run(
                                            prepare_command( filePayload, "add", `-v ${filePayload.path}` )
                                        )
                                    );

                                    break;

                                case STATE.DELETE:
                                    filePayload = new PayloadModel( `${payload.content_root}${fileStatus.path}` );

                                    promises.push(
                                        executor.run(
                                            prepare_command( filePayload, "delete", `-v ${filePayload.path}` )
                                        )
                                    );
                                    break;
                            }
                        }
                    );

                    // after all promises for new and delete are complete then perform actual push command to
                    // commit and send all changes to remote crx server.
                    Promise.all( promises )
                        .then( ( result ) => {
                            // removing status notification.
                            if ( !silent ) {
                                status_notification.dismiss();
                            }
                            executor.run(
                                prepare_command(payload, "ci", `-v ${payload.path} --force`)
                            )
                                .then( (stdout) => {
                                    handle_result( ModuleMessage.PUSH_SUCCESS, ModuleMessage.PUSH_FAILED, stdout, silent );
                                    this.removeInProgress(payload.path);
                                })
                                .catch( (error) => {
                                    messenger.error( ModuleMessage.PUSH_FAILED, true, error );
                                    this.removeInProgress(payload.path);
                                });
                        })
                })
                .catch( (error) => {
                    if ( !silent ) {
                        status_notification.dismiss();
                    }
                    messenger.error( ModuleMessage.STATS_ERROR, true, error );
                    this.removeInProgress(payload.path);
                });

        }.bind(this);

        if (!this.isInProgress(payload.path)) {
            // checking checkout status for jcr root and calling push action based on results
            validate_checkout(payload.jcr_root)
                .then( (result) => {
                    if ( result ) {
                        pushOperation( payload, silent );
                    } else {
                        this.checkout( payload, silent )
                            .then( (checkoutResult) => {
                                pushOperation( payload, silent );
                            });
                    }
                });
        }
    },

    /**
     * execute pull operation for vlt to fetch content from crx server
     * to local working copy. Notifications will be displayed based on silent
     * state given.
     *
     * checkout state will be checked before pull operation and in case of
     * missing checkout, checkout operation will be called first.
     *
     * @param payload
     * @param silent
     */
    pull(payload, silent) {

        /**
         * async function to execute vlt pull request.
         * updating content in local working copy from cr server.
         *
         * @param payload
         * @param silent
         * @returns {Promise<void>}
         */
        let pullOperation = async function( payload, silent ) {
            this.addInProgress(payload.path);
            let pullCommand = prepare_command(payload, 'up', `${payload.path} --force` );
            executor.run( pullCommand )
                .then( stdout => {
                    handle_result( ModuleMessage.PULL_SUCCESS, ModuleMessage.PULL_FAILED, stdout, silent );
                    this.removeInProgress(payload.path);
                })
                .catch( error => {
                    messenger.error(
                        ModuleMessage.PULL_FAILED,
                        true,
                        error
                    );
                    this.removeInProgress(payload.path);
                });
        }.bind(this);

        if (!this.isInProgress(payload.path)) {
            // check checkout state before performing actual pull request.
            validate_checkout( payload.jcr_root )
                .then( (result) => {
                    if ( result ) {
                        pullOperation( payload, silent );
                    } else {
                        this.checkout(payload, false)
                            .then( checkoutResult => {
                                if ( checkoutResult ) {
                                    pullOperation( payload, silent );
                                }
                            });
                    }
                })
                .catch((error) => {
                    messenger.error( ModuleMessage.ACTION_FAILED, true, error );
                });
        }
    },

    /**
     * Add a selected file or directory under vlt control.
     * notification will display how many new files are added in vlt control.
     *
     * @param payload
     * @param silent
     * @returns {Promise<void>}
     */
    async add(payload, silent) {
        if (!this.isInProgress(payload.path)) {
            // validate checkout state first.
            validate_checkout(payload.jcr_root)
                .then( (checkoutResult) => {
                    // proceed to add selected payload if checkout state is valid.
                    if ( checkoutResult ) {
                        this.addInProgress(payload.path);
                        executor.run(
                            prepare_command( payload, "add", `-v ${payload.path}` )
                        )
                            .then( (stdout) => {

                                handle_result( ModuleMessage.PULL_SUCCESS, ModuleMessage.PULL_FAILED, stdout, silent );

                                let addedFiles = [];
                                // collect all the new files added in a list
                                stdout.split("\n").forEach(
                                    ( item ) => {
                                        if ( item.indexOf("A jcr_root") != -1 ) {
                                            let file = item.substring( item.indexOf(" ") + 1, item.length );
                                            file = file.substring( 0, file.indexOf(" "));
                                            addedFiles.push(file);
                                        }
                                    }
                                );

                                // prepare detailed info based on files added.
                                let detailed_info = "Total files added '"+ addedFiles.length +"'\n";
                                addedFiles.forEach((item) => {
                                    detailed_info = detailed_info + item + "\n";
                                });

                                if ( !silent ) {
                                    messenger.success( ModuleMessage.ADD_SUCCESS, true, detailed_info );
                                }
                                handle_result( ModuleMessage.ADD_SUCCESS, ModuleMessage.ADD_FAILED, stdout, silent, detailed_info );
                                this.removeInProgress(payload.path);
                            })
                            .catch( (error) => {
                                messenger.error( ModuleMessage.ADD_FAILED, true, error);
                                this.removeInProgress(payload.path);
                            })
                    }
                });
        }
    },

    /**
     * preparing and running vlt status command to check status for all files and folder under
     * the given payload path/directory. Once status is determined it is collected in a list
     * to be processed later based on command given.
     *
     * valid status for files can be new, delete or modified.
     *
     * @param payload
     * @returns {Promise<Array>}
     */
    async status( payload ) {
        let statusCommand = prepare_command(payload, "status", `-v ${payload.path}`);
        let statusList = [];

        await executor.run( statusCommand )
            .then(
                (stdout) => {
                    let results = stdout.split("\n");
                    // prepare status based on result got from status command out put.
                    // add status in status list to be processed later.
                    results.forEach(
                        ( status ) => {
                            let type = status.substring( 0, 1 );
                            let filePath = status.substring( status.indexOf(" ") + 1, status.length );
                            if ( type != "" && type != " " ) {
                                statusList.push( new FileStatus( filePath, type ) );
                            }
                        }
                    );
                }
            )
            .catch(
                (error) => {
                    console.log(error);
                }
            );

        return statusList;
    },

    /**
     * Check if an file/ folder with given path is already under process or not.
     *
     * @param filePath
     * @returns {boolean}
     */
    isInProgress(filePath) {
       return (CONTEXT.files_inProcess.indexOf(filePath) > -1);
    },

    /**
     * Add a file/ folder under process state.
     *
     * @param filePath
     */
    addInProgress(filePath) {
        if (CONTEXT.files_inProcess.indexOf(filePath) < 0) {
            CONTEXT.files_inProcess.push(filePath);
        }
    },

    /**
     * Remove a file/ folder from under process state.
     *
     * @param filePath
     */
    removeInProgress(filePath) {
        if (CONTEXT.files_inProcess.indexOf(filePath) > -1) {
            CONTEXT.files_inProcess = CONTEXT.files_inProcess.filter(item => item != filePath);
        }
    }

};


export { VltService };
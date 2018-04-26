'use babel'
/**
 * Vlt Service to manage vlt commands
 *
 * - checkout
 * - push
 * - pull
 * - add
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

var VltService = {

    /**
     * Checkout content from crx to local working copy.
     * will add notifications if silent mode is not enabled
     *
     * @param payload
     * @param silent
     */
    checkout(payload, silent) {
        // preparing command for checkout action
        let checkoutCommand = prepare_command(payload, 'co', ` ${prepare_serverurl()} --filter ${payload.filter_file_path} . --force`);

        executor.run( checkoutCommand,
            ( stdout, stderr ) => {
                if ( !silent ) {
                    if ( stdout ) {
                        messenger.success(
                            ModuleMessage.CHECKOUT_SUCCESS,
                            false
                        );
                    }
                }
            },
            ( err ) => {
                if ( !silent ) {
                    messenger.error(
                        ModuleMessage.CHECKOUT_ERROR,
                        true,
                        err
                    );
                }
            });
    },

    // push to crx
    push(payload, silent) {

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

        let pullOperation = function( payload, silent ) {
            let pullCommand = prepare_command(payload, 'up', `${payload.path} --force` );
            executor.run( pullCommand,
                ( stdout, stderr ) => {
                    if ( !silent ) {
                        messenger.success(
                            ModuleMessage.PULL_SUCCESS,
                            false
                        );
                    }
                },
                ( err ) => {
                    messenger.error(
                        ModuleMessage.PULL_FAILED,
                        true,
                        err
                    );
                });
        };

        // check checkout state before performing actual pull request.
        validate_checkout( payload.jcr_root )
            .then( (result) => {
                if ( result ) {
                    if ( CONTEXT.checkout_map.indexOf( payload.jcr_root ) == -1 ) {
                        CONTEXT.checkout_map.push( payload.jcr_root );
                    }
                    pullOperation( payload, silent );
                } else {
                    this.checkout(payload, false);
                    pullOperation( payload, silent );
                }
            })
            .catch((error) => {
                console.error(error);
                messenger.error( ModuleMessage.ACTION_FAILED, true, error );
            });
    },

    // add in vlt control
    add(payload, silent) {

    }

};


export { VltService };
'use babel'
// Check auth option and prepare command.
// This will use executor to run vlt command.
// Takes path where to execute command.

import { CONTEXT } from "../Context";
import {Constants} from "../Constants";

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

    return vltConfigFile.exists();
}

function prepare_command( payload, action ) {
    let command = "";

    // entering in payload content directory.
    if ( CONTEXT.platform == Constants.PLATFORM_WIN ) {
        command = `cd /d ${payload.content_root} && ${CONTEXT.vlt_base} `;
    } else {
        command = `cd ${payload.content_root} && ${CONTEXT.vlt_base} `;
    }

    // adding credentials
    command = `${command}  --credentials ${atom.config.get(Constants.CONFIG_USERNAME, '')}:${atom.config.get(Constants.CONFIG_PASSWORD, '')}`;

}

var VltService = {

    // checkout from crx server.
    checkout(payload, silent) {

    },

    // push to crx
    push(payload, silent) {

    },

    // pull from crx
    pull(payload, silent) {
        console.log(payload);
        validate_checkout( payload.jcr_root )
            .then( (result) => {
                if ( result ) {
                    if ( CONTEXT.checkout_map.indexOf( payload.jcr_root ) == -1 ) {
                        CONTEXT.checkout_map.push( payload.jcr_root );
                    }
                    // checkout validated.
                } else {
                    // perform checkout.
                }
            })
            .catch((error) => {
                console.error(error);
            });
      // check for export first.
      // check for auth and prepare command.
    },

    // add in vlt control
    add(payload, silent) {

    }

};


export { VltService };
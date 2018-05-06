'use babel'
/**
 * executor responsible to run commands.
 *
 * @author prince89arora
 */

import { exec } from 'child_process';

var executor = {

    /**
     * run a given command and return promise object that will provide
     * stdout in case of success and terminal error in case of any error.
     *
     * @param command
     * @returns {Promise<any>}
     */
    run( command ) {
        return new Promise( (resolve, reject) => {
            exec( command, (err, stdout, stderr) => {
                if ( err ) {
                    reject(err);
                } else {
                    resolve(stdout)
                }
            });
        })
    }

};


export { executor };
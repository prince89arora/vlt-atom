'use babel'
// Command executor.

import { exec } from 'child_process';

var executor = {

    /**
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
                    //success( stdout, stderr );
                    resolve(stdout)
                }
            });
        })
    }

};


export { executor };
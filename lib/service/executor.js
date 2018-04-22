'use babel'
// Command executor.

import { exec } from 'child_process';

var executor = {

    run( command, success, error ) {
        exec( command, (err, stdout, stderr) => {
            if ( err ) {
                error( err );
            } else {
                success( stdout, stderr );
            }
        });
    }

};


export { executor };
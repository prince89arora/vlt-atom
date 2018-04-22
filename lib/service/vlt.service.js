'use babel'
// Check auth option and prepare command.
// This will use executor to run vlt command.
// Takes path where to execute command.

var VltService = {

    // export from crx server.
    export(payload, silent) {

    },

    // push to crx
    push(payload, silent) {

    },

    // pull from crx
    pull(payload, silent) {
        console.log(payload);
      // check for export first.
      // check for auth and prepare command.
    },

    // add in vlt control
    add(payload, silent) {

    }

};


export { VltService };
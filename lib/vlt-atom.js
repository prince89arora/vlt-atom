'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

  // Configuration for AEM server
  // Host : port information for server.
  // user name and password information to login.
  // Vault base directory path.
   config : {
     "crxHost" : {
       "description" : "AEM server host/ ip",
       "type" : "string",
       "default" : "localhost"
     },

     "crxPort" : {
       "description" : "AEM server port (leave blank if 80)",
       "type" : "integer",
       "default" : "4502"
     },

     "username" : {
       "description" : "Username to login in crx.",
       "type" : "string",
       "default" : "admin"
     },

     "password" : {
       "description" : "Password to login in crx.",
       "type" : "string",
       "default" : "admin"
     },

     "vltBase" : {
       "description" : "path to vault base directory.",
       "type" : "string",
       "default" : ""
     }
   },

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'vlt-atom:toggle': () => this.toggle()
    }));

    //Adding pull command in subcription.
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'vlt-atom:pull': () => this.pull()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {

  },

  toggle() {
    console.log('VltAtom was toggled!');
  },

  pull() {
    console.log("Crx pull executed..");
  }

};

'use babel';

import { CompositeDisposable } from 'atom';
import CrxService from './CrxService';
import {CONTEXT} from './Context';

export default {

  subscriptions: null,

  crxService : new CrxService(),

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
      'vlt-atom:settings': () => this.settings()
    }));

    //Adding pull command in subcription.
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'vlt-atom:pull': () => this.pull()
    }));

    //Adding pull command in subcription.
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'vlt-atom:push': () => this.push()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {

  },

  settings() {
    atom.workspace.open("atom://config/packages/vlt-atom");
  },

  pull() {
    let paneList = atom.workspace.getPaneItems();
    let selectedPath = "";
    paneList.forEach(function( pane ) {
      if ("TreeView" == pane.constructor.name) {
          selectedPath = pane.selectedPath;
          return;
      }
    });
    CONTEXT.crxService = this.crxService;
    this.crxService.pullFromCrx(selectedPath);
  },

  push() {
    let paneList = atom.workspace.getPaneItems();
    let selectedPath = "";
    paneList.forEach(function( pane ) {
      if ("TreeView" == pane.constructor.name) {
          selectedPath = pane.selectedPath;
          return;
      }
    });
    CONTEXT.crxService = this.crxService;
    this.crxService.pushToCrx(selectedPath);
  }

};

'use babel';

import { CompositeDisposable } from 'atom';
import {CONTEXT} from './Context';
import {ModuleMessage} from './ModuleMessage';
import {Constants} from './Constants';
import {addWatchers, removeWatchers} from './SyncService';

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
       "description" : "path to vault base directory. (ex: /opt/vlt-version or C:\\vlt-version)",
       "type" : "string",
       "default" : ""
     },

     "syncService" : {
       "description" : "If enabled changes will be pushed to crx in background",
       "type" : "boolean",
       "default" : false
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

//Adding add command in subscription
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'vlt-atom:add': () => this.add()
    }));

    if ( process.execPath.indexOf("\\") != -1 ) {
      CONTEXT.platform = Constants.PLATFORM_WIN;
      CONTEXT.pathSeparator = "\\";
    } else {
      CONTEXT.platform = Constants.PLATFORM_LINUX;
      CONTEXT.pathSeparator = "/";
    }

    if ( atom.config.get('vlt-atom.syncService', false) ) {
      addWatchers();
    }

    atom.config.onDidChange( 'vlt-atom.syncService', {}, function( obj ) {
      if ( obj.newValue ) {
        addWatchers();
      } else {
        removeWatchers();
      }
    });
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
    if ( this.checkVltConfig() ) {
      let paneList = atom.workspace.getPaneItems();
      let selectedPath = "";
      paneList.forEach(function( pane ) {
        if ("TreeView" == pane.constructor.name) {
            selectedPath = pane.selectedPath;
            return;
        }
      });

      CONTEXT.crxService.pullFromCrx(selectedPath, false);
    }
  },

  push() {
    if ( this.checkVltConfig() ) {
      let paneList = atom.workspace.getPaneItems();
      let selectedPath = "";
      paneList.forEach(function( pane ) {
        if ("TreeView" == pane.constructor.name) {
            selectedPath = pane.selectedPath;
            return;
        }
      });
      
      CONTEXT.crxService.pushToCrx(selectedPath, false);
    }
  },

  add() {
    if ( this.checkVltConfig() ) {
      let paneList = atom.workspace.getPaneItems();
      let selectedPath = "";
      paneList.forEach(function( pane ) {
        if ("TreeView" == pane.constructor.name) {
            selectedPath = pane.selectedPath;
            return;
        }
      });

      CONTEXT.crxService.addUnderVlt( selectedPath, false );
    }
  },

  checkVltConfig() {
    if ( atom.config.get(Constants.CONFIG_VLTBASE, '') != "" &&
              atom.config.get(Constants.CONFIG_VLTBASE, '') != null) {
        return true;
    }
    atom.notifications.addError(
      ModuleMessage.ERROR_INVALID_VLT,
      {
        dismissable : true
      })
    return false;
  }

};

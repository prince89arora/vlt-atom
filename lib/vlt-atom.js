'use babel';

import {CompositeDisposable} from 'atom';
import {CONTEXT} from './Context';
import {Constants} from './Constants';
import {addWatchers, removeWatchers} from './SyncService';
import {request} from "./request";
import StatusView from "./views/status_view";

export default {

    subscriptions: null,

    // Configuration for AEM server
    // Host : port information for server.
    // user name and password information to login.
    // Vault base directory path.
    config: {
        "crxHost": {
            "description": "AEM server host/ ip",
            "type": "string",
            "default": "localhost"
        },

        "crxPort": {
            "description": "AEM server port (leave blank if 80)",
            "type": "integer",
            "default": "4502"
        },

        "username": {
            "description": "Username to login in crx.",
            "type": "string",
            "default": "admin"
        },

        "password": {
            "description": "Password to login in crx.",
            "type": "string",
            "default": "admin"
        },

        "vltBase": {
            "description": "path to vault base directory. (ex: /opt/vlt-version or C:\\vlt-version)",
            "type": "string",
            "default": ""
        },

        "syncService": {
            "description": "If enabled changes will be pushed to crx in background",
            "type": "boolean",
            "default": false
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

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'vlt-atom:status': () => this.status()
        }));

        this.activateContext();
        if (atom.config.get('vlt-atom.syncService', false)) {
            console.log( "inside check 1" );
            addWatchers();
        }

        atom.config.onDidChange('vlt-atom.syncService', {}, function (obj) {
            if (obj.newValue) {
                console.log( "inside check 2" );
                addWatchers();
            } else {
                removeWatchers();
            }
        });

        this.initProjectHandler();
    },

    deactivate() {
        this.subscriptions.dispose();
        if ( this.statusView != undefined ) {
            this.statusView.destroy();
        }
    },

    serialize() {

    },

    /**
     * settings action handler
     */
    settings() {
        atom.workspace.open("atom://config/packages/vlt-atom");
    },

    /**
     * pull action handler
     */
    pull() {
        // create request for pull action for vlt.
        var pullRequest =
            new request(this.get_selected_path_project())
                .pull()
                .execute();
    },

    /**
     * push action handler
     */
    push() {
        // create request for push action for vlt.
        var pullRequest = new request(this.get_selected_path_project())
            .push()
            .execute();
    },

    /**
     * Add action handler
     */
    add() {
        // create request for add action for vlt.
        var addRequest = new request(this.get_selected_path_project())
            .add()
            .execute();
    },

    /**
     * status action handler
     */
    status() {
        this.statusView = new StatusView({
            path : this.get_selected_path_project()
        });

        CONTEXT.modal = atom.workspace.addModalPanel({
            item: this.statusView.getElement(),
            visible: true
        });
    },

    /**
     * preparing context based on configuration and platform.
     */
    activateContext() {
        if (process.execPath.indexOf("\\") != -1) {
            CONTEXT.platform = Constants.PLATFORM_WIN;
            CONTEXT.pathSeparator = "\\";
        } else {
            CONTEXT.platform = Constants.PLATFORM_LINUX;
            CONTEXT.pathSeparator = "/";
        }

        if (atom.config.get(Constants.CONFIG_VLTBASE, '') != "" &&
            atom.config.get(Constants.CONFIG_VLTBASE, '') != null) {
            CONTEXT.vlt_set_status = true;
        }

        // setup vlt base for vlt actions
        if (atom.config.get(Constants.CONFIG_VLTBASE, '').endsWith(CONTEXT.pathSeparator)) {
            CONTEXT.vlt_base = atom.config.get(Constants.CONFIG_VLTBASE, '') + "bin" + CONTEXT.pathSeparator + "vlt -v";
        } else {
            CONTEXT.vlt_base = atom.config.get(Constants.CONFIG_VLTBASE, '') +
                CONTEXT.pathSeparator + "bin" + CONTEXT.pathSeparator + "vlt -v";
        }
    },


    /**
     * Getting selected file/folder path from project panel to process request further.
     *
     * @returns {selectedPath}
     */
    get_selected_path_project() {
        let paneList = atom.workspace.getPaneItems();
        let selectedPath = undefined;
        paneList.forEach(function (pane) {
            if ("TreeView" == pane.constructor.name) {
                selectedPath = pane.selectedPath;
                return;
            }
        });
        return selectedPath;
    },

    initProjectHandler() {
        atom.project.onDidChangePaths(function (paths) {
            if (atom.config.get('vlt-atom.syncService', false)) {
                addWatchers();
            }
        });
    }

};

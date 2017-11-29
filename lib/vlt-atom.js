'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

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

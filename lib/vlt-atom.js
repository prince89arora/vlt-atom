'use babel';

import VltAtomView from './vlt-atom-view';
import { CompositeDisposable } from 'atom';

export default {

  vltAtomView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.vltAtomView = new VltAtomView(state.vltAtomViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.vltAtomView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'vlt-atom:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.vltAtomView.destroy();
  },

  serialize() {
    return {
      vltAtomViewState: this.vltAtomView.serialize()
    };
  },

  toggle() {
    console.log('VltAtom was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};

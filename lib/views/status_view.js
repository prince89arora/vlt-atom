'use babel';

/**
 * status modal content handler. Valudate status for given path in project and prepare
 * elements for status modal content.
 *
 * @constructor
 *
 * @author prince89arora
 */

import {CONTEXT} from "../Context";
import {VltService} from "../service/vlt.service";
import {PayloadModel} from "../model/payload.model";
import {STATE} from '../utils/filestate';
import {Constants} from "../Constants";

export default class StatusView {

    /**
     * create base element and calling essentials.
     *
     * @param data
     */
    constructor( data ) {
        this.data = data;
        this.element = document.createElement('div');

        this.element.classList.add('vlt-atom_status-container');

        this.prepareHeader();
        this.prepareContentArea();
        this.prepareFooter();

    }

    /**
     * prepare list content section. call status action from vlt service and check
     * status list returned by vlt service method.
     *
     * validate status list and prepare content list or empty message based on
     * status response.
     */
    prepareContentArea() {
        var listContainer = document.createElement("div");
        listContainer.classList.add( "vlt-atom_status-content" );

        var ul = document.createElement("ul");


        VltService.status(new PayloadModel( this.data.path ))
            .then( (statusList) => {
                if ( statusList.length > 0 ) {

                    statusList.forEach( (item) => {
                        var li = document.createElement("li");
                        li.classList.add(`icon`);

                        switch ( item.status ) {
                            case STATE.MODIFY:
                                li.classList.add(`status_modify`);
                                li.classList.add(`icon-pencil`);
                                break;

                            case STATE.NEW:
                                li.classList.add(`status_new`);
                                li.classList.add(`icon-plus`);
                                break;

                            case STATE.DELETE:
                                li.classList.add(`status_delete`);
                                li.classList.add(`icon-trashcan`);
                                break;
                        }

                        li.innerHTML = item.path.replace( Constants.DIR_JCRROOT, "" );
                        ul.appendChild(li);
                    });

                    listContainer.appendChild(ul);

                } else {
                    var emptyMessage = document.createElement("p");
                    emptyMessage.classList.add( "vlt-atom_status-empty-text" );

                    emptyMessage.innerHTML = "no changes found";
                    listContainer.appendChild( emptyMessage );
                }
            });

        this.element.appendChild( listContainer );
    }

    /**
     * prepare header section for modal.
     */
    prepareHeader() {
        this.statusContainer = document.createElement("div");
        this.statusContainer.classList.add("vlt-atom_status-header");

        var title = document.createElement("h1");
        title.innerHTML = "Status";

        this.statusContainer.appendChild(title);
        this.element.appendChild(this.statusContainer);

    }

    /**
     * prepare footer section for modal
     */
    prepareFooter() {
        this.closeContainer = document.createElement("div");
        this.closeContainer.classList.add("vlt-atom_status-footer");

        this.closeButton = document.createElement("button");

        this.closeButton.classList.add('btn');
        this.closeButton.classList.add('btn-default');
        this.closeButton.classList.add('icon');
        this.closeButton.classList.add('icon-close');

        this.closeButton.innerHTML = "Close";
        this.closeButton.onclick = function (e) {
            CONTEXT.modal.hide();
            CONTEXT.modal.destroy();
            CONTEXT.modal == undefined;
        };

        this.closeContainer.appendChild(this.closeButton);

        this.element.appendChild(this.closeContainer);
    }

    serialize() {
        console.log("inside serialize");
    }

    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }

}
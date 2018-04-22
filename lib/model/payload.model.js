'use babel'

import {Constants} from '../Constants';

export class PayloadModel {

    _path;
    _jcr_root;
    _content_root;

    constructor( path ) {
        this._path = path;
    }


    get path() {
        return this._path;
    }

    get jcr_root() {
        if ( this._jcr_root == undefined || this._jcr_root == null ) {
            if (this._path !== null && this._path !== "") {
                let index = this._path.indexOf( Constants.DIR_JCRROOT );
                this._jcr_root = (
                    this._path.substring(0, (index + 8))
                );
            }
        }
        return this._jcr_root;
    }

    get content_root() {
        if ( this._content_root == undefined || this._content_root == null ) {
            let index = this._path.indexOf( Constants.DIR_JCRROOT );
            this._content_root = (
                this._path.substring(0, index)
            );
        }
        return this._content_root;
    }
}
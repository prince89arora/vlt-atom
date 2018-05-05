'use babel'

export class FileStatus {

    _path;
    _fileName;
    _status;

    constructor( path, status ) {
        this._path = path;
        this._status = status;
    }


    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }


    get fileName() {
        return this._fileName;
    }

    set fileName(value) {
        this._fileName = value;
    }

}
'use babel'

import {CONTEXT} from "./Context";
import {messenger} from "./utils/messenger";
import {ModuleMessage} from "./ModuleMessage";
import {Constants} from "./Constants";
import {VltService} from "./service/vlt.service";
import {PayloadModel} from "./model/payload.model";

const REQUEST_TYPE = {
    PULL : 'pull',
    PUSH : 'push',
    ADD : 'add'
};

export class request {

    _payload = "";
    _isSilent = false;
    _requestType = '';

    constructor( payload ) {
      this._payload = payload;
    }

    push() {
        if ( this.meets_basic_needs() ) {
            this._requestType = REQUEST_TYPE.PUSH;
        }
        return this;
    }

    /**
     *
     * @returns {request}
     */
    pull() {
        if ( this.meets_basic_needs() ) {
            this._requestType = REQUEST_TYPE.PULL;
        }
        return this;
    }

    add() {
        if ( this.meets_basic_needs() ) {
            this._requestType = REQUEST_TYPE.ADD;
        }
        return this;
    }

    silent() {
      this._isSilent = true;
      return this;
    }

    /**
     * forwarding command to vlt service.
     */
    execute() {
      let pay_load = new PayloadModel( this._payload );
      switch ( this._requestType ) {

          case REQUEST_TYPE.PULL :
              VltService.pull(pay_load, this._isSilent);
              break;

          case REQUEST_TYPE.PUSH :
              VltService.push(pay_load, this._isSilent);
              break;

          case REQUEST_TYPE.ADD :
              VltService.add(pay_load, this._isSilent);
              break;

          default:
              console.log("Unable to find any request type...");
              break;
      }
    }

    /**
     * checking basic requirements for vlt operation.
     */
    meets_basic_needs() {
      var result = true;
      if ( !CONTEXT.vlt_set_status ) {
        messenger.error(ModuleMessage.ERROR_INVALID_VLT, true);
        result = false;
      }
      if ( this._payload.indexOf( Constants.DIR_JCRROOT ) == -1 ) {
          messenger.error(
              ModuleMessage.ERROR_INVALID_PATH,
              true
          );
          result = false;
      }

      return result;
    }

}
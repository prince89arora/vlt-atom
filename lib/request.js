'use babel'

import {CONTEXT} from "./Context";
import {messenger} from "./utils/messenger";
import {ModuleMessage} from "./ModuleMessage";
import {Constants} from "./Constants";
import {VltService} from "./service/vlt.service";

const REQUEST_TYPE = {
    PULL : 'pull',
    PUSH : 'push'
};

export class request {



    _payload = "";
    _isSilent = false;
    _requestType = '';

    constructor( payload ) {
      this._payload = payload;
    }

    push() {
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

    silent() {
      this._isSilent = true;
      return this;
    }

    /**
     * forwarding command to vlt service.
     */
    execute() {
      switch ( this._requestType ) {

          case REQUEST_TYPE.PULL :
              VltService.pull(this._payload, this._isSilent);
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
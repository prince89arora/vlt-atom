'use babel'

/**
 * Messenger to display message on screen with a text heading, or detailed description with heading.
 *
 * @type {{error: messenger.error, info: messenger.info, success: messenger.success, warn: messenger.warn, config: function(*=, *=)}}
 */
var messenger = {

    /**
     * Display error message on screen with dismissible or detailed message option.
     *
     * @param message
     * @param canDismiss
     * @param detail
     */
    error: function( message, canDismiss, detail ) {
        atom.notifications.addError(
            message,
            this.config(canDismiss, detail)
        );
    },

    /**
     * Display information message on screen with dismissible or detailed message option.
     *
     * @param message
     * @param canDismiss
     * @param detail
     */
    info: function ( message, canDismiss, detail ) {
        atom.notifications.addInfo(
            message,
            this.config(canDismiss, detail)
        );
    },

    /**
     * Display success message on screen with dismissible or detailed message option.
     *
     * @param message
     * @param canDismiss
     * @param detail
     */
    success: function ( message, canDismiss, detail ) {
        atom.notifications.addSuccess(
            message,
            this.config(canDismiss, detail)
        );
    },

    /**
     * Display warn message on screen with dismissible or detailed message option.
     *
     * @param message
     * @param canDismiss
     * @param detail
     */
    warn: function ( message, canDismiss, detail ) {
        atom.notifications.addWarn(
            message,
            this.config(canDismiss, detail)
        );
    },

    /**
     * preparing additional parameters for message to be displayed.
     *
     * @param canDismiss
     * @param detail
     */
    config: function ( canDismiss, detail ) {
        let config = {};
        if ( canDismiss != undefined && canDismiss != null ) {
            config.dismissable = canDismiss;
        }

        if ( detail != undefined && detail != null ) {
            config.detail = detail;
        }
        return config;
    }

};

export { messenger };


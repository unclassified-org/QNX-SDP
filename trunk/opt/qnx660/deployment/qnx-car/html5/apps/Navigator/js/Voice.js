Navigator.ns('Navigator');

/**
 *
 * @author dkerr
 * $Id: Voice.js 7093 2013-09-06 18:38:37Z dkerr@qnx.com $
 */
Navigator.Voice = new ((function () {

    var self = this,
        _isActive = false;

    ///// EVENTS /////
    /**
    {
        event: 'Navigator.Voice.E_VOICE_CANCEL',
    }
    */
    this.E_VOICE_CANCEL = 'Navigator.Voice.E_VOICE_CANCEL';
        
    ///// PRIVATE METHODS /////

    /**
     * Updates the voice UI element on voice state events.
     * @param e {Object} The event object
     * Ex. {
     *      state: {String} Can be 'idle','prompting','listening' or 'processing'
     * }
     */
    var onVoiceStateChange = function (e) {
        if ( e.state != "idle" ) {
            qnx.navigator.overlay.show({type: 'voice', state: e.state});
        } else {
            qnx.voice.cancel();
            // dispatch 'cancel' so the Navigator can switch back to the previous tab
            self.dispatch( self.E_VOICE_CANCEL );
            // unhandled speech is shown to provide feedback 
            setTimeout(hideUI,1500);
        }
    };
    
    /**
     * Updates the voice UI element on voice result events.
     * @param e {Object} The event object
     * Ex. {
     *      result: {
     *          confidence: {Number} An indication of the processing quality. 0 - 100
     *          utterance: {String} The text result of the captured audio.
     *      }
     * }
     */
    var onVoiceResultChange = function (e) {
        if (e.result.confidence === 0) {
            qnx.navigator.overlay.show({type:'voice', result:{utterance:'invalid input'}});
        } else {
            qnx.navigator.overlay.show({type:'voice', result:{utterance:e.result.utterance, confidence:e.result.confidence}});
        }
        
        if (e.result.utterance == "Cancel") {
            hideUI();
            // dispatch 'cancel' so the Navigator can switch back to the previous tab
            self.dispatch( self.E_VOICE_CANCEL );
        }
    };
    
    /**
     * Updates the voice UI element after speech recognition is handled.
     */
     var onVoiceHandledChange = function (e) {
        if (e.handled === 'unhandled') {
            qnx.voice.cancel();
            // dispatch 'cancel' so the Navigator can switch back to the previous tab
            self.dispatch( self.E_VOICE_CANCEL );
            // unhandled speech is shown to provide feedback 
            setTimeout(hideUI,1500);
        }
    };

    /**
     * Initializes the module and listens for voice state and result events.
     */
    var setVoiceCmdList = function (list) {
        // collect the apps for the list 
        qnx.voice.setList(list);
    };
    
    /**
     * Delay the closing animation of the voice UI.
     * Ex.  Cancelling voice req - close voice UI immediately
     *      Switching tab - voice UI updates, tab switches, close voice UI
     *      Launching tab/app - voice UI updates, tab switches, app launches, close voice UI
     */
    var hideUI = function (delay) {
        qnx.navigator.overlay.hide({type:'voice'});
    };
    
    
    ///// PUBLIC METHODS /////

    /**
     * Initializes the module and listens for voice state and result events.
     */
    self.init = function (cmdList) {
        blackberry.event.addEventListener("voicestate", onVoiceStateChange);
        blackberry.event.addEventListener("voiceresult", onVoiceResultChange);
        blackberry.event.addEventListener("voicehandled", onVoiceHandledChange);
        
        // set the state to idle
        qnx.voice.cancel();

        // set the list of application for the voice service
        setVoiceCmdList(cmdList);
    };

    /**
     * Select is called from the UI and prompts action from voice subsystem
     */
    self.select = function () {
        var state = qnx.voice.getState();
        switch (state) {
            case 'idle':
                _isActive = false;
            // selecting while in the prompting state will interupt the prompt and transition to listening
            case 'prompting':
                qnx.navigator.overlay.show({type:'voice'});
                qnx.voice.listen();
                _isActive = true;
                break;
            case 'listening':
                qnx.voice.stopListening();
                _isActive = true;
                // visibility is still true as this just turns the microphone off. (in case of background noise)
                break;
            case 'processing':
                _isActive = true;
                break;
        }
    };

    /**
     * Cancel stops all actions and resets the voice subsystem state to 'idle'.
     */
    self.cancel = function () {
        hideUI();
        qnx.voice.cancel();
        _isActive = false;
    };

    /**
     * Utility function to add a application or tab name to the voice system
     */
    self.addItem = function (item) {
        qnx.voice.addItem(item);
    };

    /**
     * Utility function to determine if voice control ( and the overlay) is active
     */
    self.isActive = function () {
        return _isActive;
    };

}).extend(Navigator.EventDispatcher));
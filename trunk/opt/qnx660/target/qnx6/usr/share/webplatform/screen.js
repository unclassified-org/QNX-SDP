///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT SCREEN plugin
///////////////////////////////////////////////////////////////////

JNEXT.JScreen = (function()
{
    var self = this;
    var screenObj = {};
    var m_strObjId = -1;
    var connected = false;
    var connecting = false;
    var eventRegistered = false;
    var jscreenSoAdded = false;
    var jscreenObjCreated = false;
    var appStarted = false;
    var appName = '';
    var appPid = 0;
    var numApps = 0;
    var appPids = new Array(50);

    var SCREEN_PROPERTY_BUFFER_SIZE            = 5;
    var SCREEN_PROPERTY_EGL_HANDLE             = 12;
    var SCREEN_PROPERTY_FORMAT                 = 14;
    var SCREEN_PROPERTY_INTERLACED             = 22;
    var SCREEN_PROPERTY_PHYSICALLY_CONTIGUOUS  = 32;
    var SCREEN_PROPERTY_PLANAR_OFFSETS         = 33;
    var SCREEN_PROPERTY_POINTER                = 34;
    var SCREEN_PROPERTY_PROTECTED              = 36;
    var SCREEN_PROPERTY_STRIDE                 = 44;
    var SCREEN_PROPERTY_PHYSICAL_ADDRESS       = 55;

    /*
     ** context properties
     */

    var SCREEN_PROPERTY_DISPLAY_COUNT          = 59;
    var SCREEN_PROPERTY_DISPLAYS               = 60;
    var SCREEN_PROPERTY_IDLE_STATE             = 81;
    var SCREEN_PROPERTY_IDLE_TIMEOUT           = 83;
    var SCREEN_PROPERTY_KEYBOARD_FOCUS         = 84;
    var SCREEN_PROPERTY_MTOUCH_FOCUS           = 85;
    var SCREEN_PROPERTY_POINTER_FOCUS          = 86;

    /*
     ** display properties
     */

    var SCREEN_PROPERTY_GAMMA                  = 2;
    var SCREEN_PROPERTY_ID_STRING              = 20;
    var SCREEN_PROPERTY_ROTATION               = 38;
    var SCREEN_PROPERTY_SIZE                   = 40;
    var SCREEN_PROPERTY_TRANSPARENCY           = 46;
    var SCREEN_PROPERTY_TYPE                   = 47;
    var SCREEN_PROPERTY_MIRROR_MODE            = 58;
    var SCREEN_PROPERTY_ATTACHED               = 64;
    var SCREEN_PROPERTY_DETACHABLE             = 65;
    var SCREEN_PROPERTY_NATIVE_RESOLUTION      = 66;
    var SCREEN_PROPERTY_PROTECTION_ENABLE      = 67;
    var SCREEN_PROPERTY_PHYSICAL_SIZE          = 69;
    var SCREEN_PROPERTY_FORMAT_COUNT           = 70;
    var SCREEN_PROPERTY_FORMATS                = 71;
    var SCREEN_PROPERTY_FILL_PORT_AREA         = 72;
    var SCREEN_PROPERTY_KEEP_AWAKES            = 82;
    var SCREEN_PROPERTY_ID                     = 87;
    var SCREEN_PROPERTY_POWER_MODE             = 88;
    var SCREEN_PROPERTY_MODE_COUNT             = 89;
    var SCREEN_PROPERTY_MODE                   = 90;

    /*
     ** event properties
     */

    var SCREEN_PROPERTY_BUTTONS                = 6;
    var SCREEN_PROPERTY_DEVICE_INDEX           = 10;
    var SCREEN_PROPERTY_DISPLAY                = 11;
    var SCREEN_PROPERTY_GROUP                  = 18;
    var SCREEN_PROPERTY_INPUT_VALUE            = 21;
    var SCREEN_PROPERTY_JOG_COUNT              = 23;
    var SCREEN_PROPERTY_KEY_CAP                = 24;
    var SCREEN_PROPERTY_KEY_FLAGS              = 25;
    var SCREEN_PROPERTY_KEY_MODIFIERS          = 26;
    var SCREEN_PROPERTY_KEY_SCAN               = 27;
    var SCREEN_PROPERTY_KEY_SYM                = 28;
    var SCREEN_PROPERTY_NAME                   = 30;
    var SCREEN_PROPERTY_POSITION               = 35;
    /* SCREEN_PROPERTY_SIZE                = 40, */
    var SCREEN_PROPERTY_SOURCE_POSITION        = 41;
    var SCREEN_PROPERTY_SOURCE_SIZE            = 42;
    /* SCREEN_PROPERTY_TYPE                = 47, */
    var SCREEN_PROPERTY_USER_DATA              = 49;
    var SCREEN_PROPERTY_WINDOW                 = 52;
    /* SCREEN_PROPERTY_MIRROR_MODE         = 58, */
    var SCREEN_PROPERTY_EFFECT                 = 62;
    /* SCREEN_PROPERTY_ATTACHED            = 64, */
    /* SCREEN_PROPERTY_PROTECTION_ENABLE   = 67, */
    var SCREEN_PROPERTY_TOUCH_ID               = 73;
    var SCREEN_PROPERTY_TOUCH_ORIENTATION      = 76;
    var SCREEN_PROPERTY_TOUCH_PRESSURE         = 77;
    var SCREEN_PROPERTY_TIMESTAMP              = 78;
    var SCREEN_PROPERTY_SEQUENCE_ID            = 79;
    /* SCREEN_PROPERTY_IDLE_STATE          = 81, */
    /* SCREEN_PROPERTY_MODE                = 90, */
    var SCREEN_PROPERTY_MOUSE_WHEEL            = 94;

    /*
     ** pixmap properties
     */

    var SCREEN_PROPERTY_ALPHA_MODE             = 1;
    /* SCREEN_PROPERTY_BUFFER_SIZE         = 5, */
    var SCREEN_PROPERTY_COLOR_SPACE            = 8;
    /* SCREEN_PROPERTY_FORMAT              = 14, */
    /* SCREEN_PROPERTY_ID_STRING           = 20, */
    var SCREEN_PROPERTY_RENDER_BUFFERS         = 37;
    var SCREEN_PROPERTY_USAGE                  = 48;

    /*
     ** window properties
     */

    /* SCREEN_PROPERTY_ALPHA_MODE          = 1, */
    var SCREEN_PROPERTY_BRIGHTNESS             = 3;
    var SCREEN_PROPERTY_BUFFER_COUNT           = 4;
    /* SCREEN_PROPERTY_BUFFER_SIZE         = 5, */
    var SCREEN_PROPERTY_CLASS                  = 7;
    /* SCREEN_PROPERTY_COLOR_SPACE         = 8, */
    var SCREEN_PROPERTY_CONTRAST               = 9;
    /* SCREEN_PROPERTY_DISPLAY             = 11, */
    var SCREEN_PROPERTY_FLIP                   = 13;
    /* SCREEN_PROPERTY_FORMAT              = 14, */
    var SCREEN_PROPERTY_FRONT_BUFFER           = 15;
    var SCREEN_PROPERTY_GLOBAL_ALPHA           = 16;
    var SCREEN_PROPERTY_PIPELINE               = 17;
    /* SCREEN_PROPERTY_GROUP               = 18, */
    var SCREEN_PROPERTY_HUE                    = 19;
    /* SCREEN_PROPERTY_ID_STRING           = 20, */
    var SCREEN_PROPERTY_MIRROR                 = 29;
    var SCREEN_PROPERTY_OWNER_PID              = 31;
    /* SCREEN_PROPERTY_POSITION            = 35, */
    /* SCREEN_PROPERTY_RENDER_BUFFERS      = 37, */
    /* SCREEN_PROPERTY_ROTATION            = 38, */
    var SCREEN_PROPERTY_SATURATION             = 39;
    /* SCREEN_PROPERTY_SIZE                = 40, */
    /* SCREEN_PROPERTY_SOURCE_POSITION     = 41, */
    /* SCREEN_PROPERTY_SOURCE_SIZE         = 42, */
    var SCREEN_PROPERTY_STATIC                 = 43;
    var SCREEN_PROPERTY_SWAP_INTERVAL          = 45;
    /* SCREEN_PROPERTY_TRANSPARENCY        = 46, */
    /* SCREEN_PROPERTY_TYPE                = 47, */
    /* SCREEN_PROPERTY_USAGE               = 48, */
    var SCREEN_PROPERTY_USER_HANDLE            = 50;
    var SCREEN_PROPERTY_VISIBLE                = 51;
    var SCREEN_PROPERTY_ZORDER                 = 54;
    var SCREEN_PROPERTY_SCALE_QUALITY          = 56;
    var SCREEN_PROPERTY_SENSITIVITY            = 57;
    var SCREEN_PROPERTY_CBABC_MODE             = 61;
    var SCREEN_PROPERTY_FLOATING               = 63;
    var SCREEN_PROPERTY_VIEWPORT_POSITION      = 74;
    var SCREEN_PROPERTY_VIEWPORT_SIZE          = 75;
    var SCREEN_PROPERTY_IDLE_MODE              = 80;
    var SCREEN_PROPERTY_CLIP_POSITION          = 91;
    var SCREEN_PROPERTY_CLIP_SIZE              = 92;
    var SCREEN_PROPERTY_COLOR                  = 93;
    //};
    /*
     * Available alpha modes. The default value is non pre-multiplied. In this
     * case, src blending is done using the equation
     *
     *   c(r,g,b) = s(r,g,b) * s(a) + d(r,g,b) * (1 - s(a)).
     *
     * Pre-multiplied alpha content is src blended using the equation
     *
     *   c(r,g,b) = s(r,g,b) + d(r,g,b) * (1 - s(a)).
     */
    //enum {
    var SCREEN_NON_PRE_MULTIPLIED_ALPHA        = 0;
    var SCREEN_PRE_MULTIPLIED_ALPHA            = 1;
    //};

    /*
     * Pixel formats supported. Formats with an alpha channel will have source
     * alpha enabled automatically. Applications that want composition manager to
     * disregard the alpha channel can choose a pixel format with an X.
     */
    //enum {
    var SCREEN_FORMAT_BYTE                     = 1;
    var SCREEN_FORMAT_RGBA4444                 = 2;
    var SCREEN_FORMAT_RGBX4444                 = 3;
    var SCREEN_FORMAT_RGBA5551                 = 4;
    var SCREEN_FORMAT_RGBX5551                 = 5;
    var SCREEN_FORMAT_RGB565                   = 6;
    var SCREEN_FORMAT_RGB888                   = 7;
    var SCREEN_FORMAT_RGBA8888                 = 8;
    var SCREEN_FORMAT_RGBX8888                 = 9;
    var SCREEN_FORMAT_YVU9                     = 10;
    var SCREEN_FORMAT_YUV420                   = 11;
    var SCREEN_FORMAT_NV12                     = 12;
    var SCREEN_FORMAT_YV12                     = 13;
    var SCREEN_FORMAT_UYVY                     = 14;
    var SCREEN_FORMAT_YUY2                     = 15;
    var SCREEN_FORMAT_YVYU                     = 16;
    var SCREEN_FORMAT_V422                     = 17;
    var SCREEN_FORMAT_AYUV                     = 18;
    var SCREEN_FORMAT_NFORMATS;
    //};

    /*
     * Usage flags are used when allocating buffers. Depending on the usage;
     * different constraints like width, height, stride granularity or special
     * alignment must be observed. The usage is also a valuable hint in determining
     * the amount of caching that can be set on a particular buffer. The display
     * usage flag is reserved and cannot be used by applications.
     */
    //enum {
    var SCREEN_USAGE_DISPLAY                   = (1 << 0);
    var SCREEN_USAGE_READ                      = (1 << 1);
    var SCREEN_USAGE_WRITE                     = (1 << 2);
    var SCREEN_USAGE_NATIVE                    = (1 << 3);
    var SCREEN_USAGE_OPENGL_ES1                = (1 << 4);
    var SCREEN_USAGE_OPENGL_ES2                = (1 << 5);
    var SCREEN_USAGE_OPENVG                    = (1 << 6);
    var SCREEN_USAGE_VIDEO                     = (1 << 7);
    var SCREEN_USAGE_CAPTURE                   = (1 << 8);
    var SCREEN_USAGE_ROTATION                  = (1 << 9);
    var SCREEN_USAGE_OVERLAY                   = (1 << 10);
    //};

    //enum {
    var SCREEN_TRANSPARENCY_SOURCE             = 0;
    var SCREEN_TRANSPARENCY_TEST               = 1;
    var SCREEN_TRANSPARENCY_SOURCE_COLOR       = 2;
    var SCREEN_TRANSPARENCY_SOURCE_OVER        = 3;
    var SCREEN_TRANSPARENCY_NONE               = 4;
    var SCREEN_TRANSPARENCY_DISCARD            = 5;
    //};

    //enum {
    var SCREEN_SENSITIVITY_TEST                = 0;
    var SCREEN_SENSITIVITY_ALWAYS              = 1;
    var SCREEN_SENSITIVITY_NEVER               = 2;
    var SCREEN_SENSITIVITY_NO_FOCUS            = 3;
    var SCREEN_SENSITIVITY_FULLSCREEN          = 4;
    //};

    //enum {
    var SCREEN_QUALITY_NORMAL                  = 0;
    var SCREEN_QUALITY_FASTEST                 = 1;
    var SCREEN_QUALITY_NICEST                  = 2;
    //};

    //enum {
    var SCREEN_CBABC_MODE_NONE                 = 0x7671;
    var SCREEN_CBABC_MODE_VIDEO                = 0x7672;
    var SCREEN_CBABC_MODE_UI                   = 0x7673;
    var SCREEN_CBABC_MODE_PHOTO                = 0x7674;

    self.getId = function() {
        return self.m_strObjId;
    };

    /** Default on eventhandler */
    self.onEvent = function( strData ) {
        var arData = strData.split( " " );
        var strEventDesc = arData[ 0 ];
        switch ( strEventDesc )
        {
            case "Error":
            {
                self.onError();
                break;
            }

            case "OnWindowCreated":
            {
                dispatchCustomEvent("OnWindowCreated",arData[1])
                break;
            }

            case "OnWindowPosted": {
                dispatchCustomEvent("OnWindowPosted",arData[1])
                break;
            }

            case "OnWindowClosed":
            {
                dispatchCustomEvent("OnWindowClosed",arData[1])
                break;
            }

            case "OnConnected":
            {
                dispatchCustomEvent("OnConnected",null)

                self.connecting = false;
                self.connected = true;
                break;
            }

        }
    };

    self.onError = function() {
        dispatchCustomEvent("USPECTIFIED_ERROR","Error");
    };

    /**
        Initialises screen
    */
    self.screen_init = function() {
        if ( !jscreenObjCreated )  {
            if ( (self.m_strObjId = JNEXT.createObject( "jscreen.JScreen" )) == "" )  {
                self.connecting = false;
                alert( "error initializing jscreen.so - check if I am allowed to be a screen window manager" );
                return false;
            }
            jscreenObjCreated = true;
        }
    };

    /**
        Conntect to the screen extension
    */
    self.screen_connect = function() {
         if ( !self.connected && !self.connecting) {
            self.connecting = true;

            var strVal = JNEXT.invoke(self.m_strObjId, "Connect");
            var arParams = strVal.split( " " );
            if ( arParams[ 0 ] != "Ok" ) {
                self.connecting = false;
                console.log('Problem connecting to screen! check if I am allowed to be a screen window manager' );
                return false;
            }

            self.connecting = false;
            self.connected = true;

            //var strVal = JNEXT.invoke(self.m_strObjId, "SetVerbose 2");
            //NOTE THIS WOULD SET VERBOSE TO 1, OTHERWISE IT IS 0
            //var strVal = JNEXT.invoke(self.m_strObjId, "SetVerbose");

            if ( !eventRegistered ) {
                eventRegistered = true;
                JNEXT.registerEvents( self );
            }
        }
        else {
            console.log('Already connected to screen!');
        }
    };

    /**
        Closes screen connection
    */
    self.close = function() {
        if (jscreenObjCreated) {
            strRes = JNEXT.invoke( self.m_strObjId, "Close" );
        }
        if (eventRegistered) {
            JNEXT.unregisterEvents( self );
        }

        connected = false;
        connecting = false;
        eventRegistered = false;
        jscreenSoAdded = false;
        jscreenObjCreated = false;
    };

    /**
        Change width and height of the applicaiton using PID
    */
    self.resizePid = function(width, height,pid) {
        var strVal = JNEXT.invoke(self.m_strObjId, "ResizeWindow", pid+" "+width+" "+height);
        var arParams = strVal.split( " " );
        return ( arParams[ 0 ] == "Ok" );
    };

    /** Change z order property of the applicaiton window
    return true if operation was successful*/
    self.setZOrderPID = function(pid, val) {
        var strVal = JNEXT.invoke(self.m_strObjId, "FrontWindow", pid +" "+val);
        var arParams = strVal.split( " " );
        return ( arParams[ 0 ] == "Ok" );
    };

    /** Changes X and Y coordinates of the window
    returbs true if succesful */
    self.moveWindowPid = function(pid,x,y) {
        var strVal = JNEXT.invoke(self.m_strObjId, "MoveWindow", pid+" "+x+" "+y);
        var arParams = strVal.split( " " );
        return ( arParams[ 0 ] == "Ok" );
    };

    /** dispatches custum eventof 'typ'e with custom data 'value' */
    self.dispatchCustomEvent = function(type,value) {
        var customEvent=document.createEvent("Event");
        customEvent.initEvent(type, true, true);
        customEvent.customData = value;
        self.dispatchEvent(customEvent);
    }

    /** Sets Alpha for current window
        returbs true if succesful */
    self.setAlpha = function(pid,value) {
        var strVal = JNEXT.invoke(self.m_strObjId, "SetProperty",  pid +" " + "SCREEN_PROPERTY_GLOBAL_ALPHA" + " " + value);
        var arParams = strVal.split( " " );
        return ( arParams[ 0 ] == "Ok" );
    }

    /** For property id please see set of constans at the beginning of the file */
    self.setProperty = function(pid,propertyID,value) {
        var strVal = JNEXT.invoke(self.m_strObjId, "SetProperty",  pid +" " + propertyID + " " + value);
    }

    /** Sets events sensivity for current window by PID
    SCREEN_SENSITIVITY_NEVER - all Screen input event falling throug the window
    SCREEN_SENSITIVITY_ALWAYS - all Screen input events captured by window*/
    self.setSensivity = function(pid,value) {
        if(value)
            var strVal = JNEXT.invoke(self.m_strObjId, "SetProperty",  pid +" " + SCREEN_PROPERTY_SENSITIVITY + " " + SCREEN_SENSITIVITY_NEVER);
        else
            var strVal = JNEXT.invoke(self.m_strObjId, "SetProperty",  pid +" " + SCREEN_PROPERTY_SENSITIVITY + " " + SCREEN_SENSITIVITY_ALWAYS);
    }

    self.m_strObjId = "";

    return self;

}());

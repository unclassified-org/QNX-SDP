// Constants for use with the open() function
/** Used with the open() function as a mode parameter. This opens the file in 
 * read-only mode. */
JNEXT.PPS_RDONLY = "0";
/** Used with the open() function as a mode parameter. This opens the file in
 * write-only mode. Opening in write-only has less overhead than any other mode
 * and should be used whenever possible. */
JNEXT.PPS_WRONLY = "1";
/** Used with the open() function as a mode parameter. This opens the file in 
 * read-write mode. */
JNEXT.PPS_RDWR = "2";
/** Used with the open() function as a mode parameter. This flag specifies that
 * the PPS object should be created if it does not exist. This flag can be or-ed 
 * with the PPS_RDONLY, PPS_WRONLY or PPS_RDWR constants in the following manner:
 * 
 * open("/pps/someppsobject",  PPS_CREATE|PPS_WRONLY);
 * 
 * NOTE: O_CREAT flag is actually 0x100 (256 decimal), not '400' as is implied 
 * by trunk/lib/c/public/fcntl.h.
 */
JNEXT.PPS_CREATE = "256";
/** Used with the open() function as a mode parameter. This flag specifies that
 * the PPS object should be created and opened in read-write mode. It is a 
 * convenience constant equivalent to:
 * 
 * open("/pps/someppsobject",  PPS_CREATE|PPS_RDWR);
 */
JNEXT.PPS_RDWR_CREATE = "258";

// Constants used in the init() function
/** The name of the native plugin library (*.so). */
JNEXT.PPS_LIB_NAME = "jpps";
/** Name of the JNEXT PPS object, which is a concatenation of the library name and the 
 * native class name. */
JNEXT.PPS_OBJ_NAME = JNEXT.PPS_LIB_NAME + ".PPS";

/**
 * Loggins is off
 * */
JNEXT.VERBOSITY_NONE = "0";
/**
 * Logs messages of INFO level
 * */
JNEXT.VERBOSITY_INFO = "1";
/**
 * Logs messages of DEBUG level
 * */
JNEXT.VERBOSITY_DEBUG = "2";


JNEXT.PPS = function()
{
    var self = this;
    var ppsObj = {};
    var m_strObjId;
    
    self.open = function(strPPSPath, mode, opts) {

		var parameters = strPPSPath + " " + mode + (opts ? " " + opts : ""); 
		var strVal = JNEXT.invoke(self.m_strObjId, "Open", parameters);
		
		var arParams = strVal.split(" ");
		
		// If there's an error, output to the console
		if (arParams[0] != "Ok") {
			console.error(strVal);
			return false;
		}
		
		return true;
    };
    
    self.read = function() {
    	
    	// Read a line from the file that was previously opened
        var strVal = JNEXT.invoke(self.m_strObjId, "Read");
        var arParams = strVal.split(" ");
        
        if (arParams[0] != "Ok") {
        	console.error(strVal);
            return false;
        }

        var json = strVal.substr(arParams[0].length + 1);
        self.ppsObj = JSON.parse(json);
        return true;
    };
      
    self.write = function(obj) {
    	
		var jstr = JSON.stringify(obj);
		var strVal = JNEXT.invoke(self.m_strObjId, "Write", jstr);
        var arParams = strVal.split(" ");
        
        if (arParams[0] != "Ok") {
        	console.error(strVal);
            return false;
        }
        
        return true;
    };
    
    self.close = function() {
    	
        strRes = JNEXT.invoke(self.m_strObjId, "Close");
        strRes = JNEXT.invoke(self.m_strObjId, "Dispose");
        JNEXT.unregisterEvents(self);
    };
    
    self.getId = function() {
        return self.m_strObjId;
    };
    
    self.onEvent = function( strData ) {
        var arData = strData.split( " " );
        var strEventDesc = arData[ 0 ];
        switch ( strEventDesc )
        {
            case "ppsOpenFailed":
            case "ppsWriteFailed":
            case "ppsReadFailed":
            {
                var errorMsg = strData.substr(strEventDesc.length + 1);
                console.error(errorMsg);
                
                // If a client has an onError handler installed, call it
                if (self.onError) {
                	self.onError(errorMsg);
                }
                
                break;
            }
            
            case "ppsFirstRead": 
            {
                var jsonInfo = strData.substr(strEventDesc.length + 1);
                var info = "";
                
                // In some cases, the first read legitimately does not contain 
                // any data, so make sure we handle that case
                if (jsonInfo.length > 0) {
                	
                    info = JSON.parse(jsonInfo);
                    
                    // Update the local cache with a copy of the entire PPS object as it currently stands
					self.ppsObj = info["allData"];
                }
				
                if (self.onReady) {
                    self.onReady((jsonInfo.length > 0) ? info["allData"] : "");
                }
                break;
            }
            
            case "OnChange":
            {
				var jsonData = strData.substr(strEventDesc.length + 1);
				
				// data contains both the change data and the "full" data, in order
				// to avoid making a call to read() during the onChange
				var data = JSON.parse(jsonData);

				// Update the local cache with a copy of the entire PPS object as it currently stands
				self.ppsObj = data["allData"];
				
				// Send a change event with only the data that changed
				if (self.onChange != null) {
					self.onChange(data["changeData"]);
				}
				break;
            }
        }
    };

    self.readPPSObject = function(pathToPPS, callback, options) {
        var ppsData = {},
            result;
            
        try {
            self.init();
            if (self.open(pathToPPS, "0", options)) {
                result = self.read();
                if (result) {
                    ppsData = result;
                }
            }
        } finally {
            self.close();
        }
        
        callback(ppsData);
    };
    
    self.init = function() {
    
        if (!JNEXT.require(JNEXT.PPS_LIB_NAME)) {
	    	console.error("Unable to load \"" + JNEXT.PPS_LIB_NAME + "\". PPS is unavailable.");
            return false;
        }
        
        self.m_strObjId = JNEXT.createObject(JNEXT.PPS_OBJ_NAME);
        if (self.m_strObjId == "")  {
            console.error("JNext could not create the native PPS object \"" + JNEXT.PPS_OBJ_NAME + "\". PPS is unavailable.");
            return false;
        }
        
        JNEXT.registerEvents(self);
    };

	/**
	 * Sets verbosity
	 *
	 * @param mode {String} Verbosity mode: 0 - turn off, 1 - info, 2 - debug
	 */
	self.setVerbosity = function(mode) {

		var strVal = JNEXT.invoke(this.m_strObjId, "SetVerbose", mode);

		var arParams = strVal.split(" ");

		if (arParams[0] != "Ok") {
			console.error(strVal);
			return false;
		}

		return true;
	};

    return self;
};

module.exports = {createObject : function () {return new JNEXT.PPS()}};

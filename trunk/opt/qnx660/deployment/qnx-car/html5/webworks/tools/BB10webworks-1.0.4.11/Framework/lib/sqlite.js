///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT database plugins
///////////////////////////////////////////////////////////////////

JNEXT.DBQuery = function( objDB, strQueryId )
{
    var self = this;
    self.m_strQueryId = strQueryId;
    self.m_objDB      = objDB;
    
    self.getColNames = function()
    {
        var strVal = self.m_objDB.getColNames( self.m_strQueryId );
        var arParams = strVal.split( " " );
        if ( arParams[ 0 ] == "Error" )
        {
            return null;
        }
        
        var nStart = arParams[ 0 ].length + arParams[ 1 ].length + 2;
        var strExp = "var arRow = " + strVal.substr( nStart );
        eval( strExp );
        return arRow;
    }
    
    self.getColTypes = function()
    {
        var strVal = self.m_objDB.getColTypes( self.m_strQueryId );
        var arParams = strVal.split( " " );
        if ( arParams[ 0 ] == "Error" )
        {
            return null;
        }
        
        var nStart = arParams[ 0 ].length + arParams[ 1 ].length + 2;
        var strExp = "var arRow = " + strVal.substr( nStart );
        eval( strExp );
        return arRow;
    }
    
    self.getRow = function()
    {
        var strVal = self.m_objDB.getRow( self.m_strQueryId );
        var arParams = strVal.split( " " );
        if ( arParams[ 0 ] == "LastRow" )
        {
            return null;
        }
        
        if ( arParams[ 0 ] != "NewRow" )
        {
            return "Error";
        }
        
        var nStart = arParams[ 0 ].length + arParams[ 1 ].length + 2;
        var strExp = "var arRow = " + strVal.substr( nStart ).replace(/\r?\n/g, '\\n');
        eval( strExp );
        return arRow;
    }
    
    self.close = function()
    {
        self.m_objDB.closeQuery( self.m_strQueryId );
    }
}

///////////////////////////////////////////////////////////////////

JNEXT.SQLite3DB = function()
{
    var self = this;
    
    self.open = function( strConnectString )
    {
        var strVal = JNEXT.invoke( self.m_strObjId, "Open " + strConnectString );
        var arParams = strVal.split( " " );
        return ( arParams[ 0 ] == "Ok" );
    }

    self.openAsync = function( strConnectString )
    {
        var strVal = JNEXT.invoke( self.m_strObjId, "Open " + strConnectString + " async" );
        var arParams = strVal.split( " " );
        return ( arParams[ 0 ] == "Ok" );
    }
    
    self.query = function( strLine )
    {
        strLine = strLine.replace(/^\s*/, ''); // trim leading whitespace
        strLine = strLine.replace(/\s*$/, ''); // trim trailing whitespace
        var strVal = JNEXT.invoke( self.m_strObjId, "Query " + strLine );

        var arParams = strVal.split( " " );
        if ( arParams[ 0 ] == "Error" )
        {
            return null;
        }
        
        if ( arParams[ 0 ] == "Ok" )
        {
            return true;
        }
        
        if ( arParams[ 0 ] != "NewQuery" )
        {
            return false;
        }
        
        // initialize query with the returned query id
        var objQuery = new JNEXT.DBQuery( self, arParams[ 2 ] );
        return objQuery;
    }
    
    self.closeQuery = function( strQueryId )
    {
        return JNEXT.invoke( self.m_strObjId, "CloseQuery " + strQueryId );
    }
    
    self.getRow = function( strQueryId )
    {
        return JNEXT.invoke( self.m_strObjId, "GetRow " + strQueryId );
    }
    
    self.getColNames = function( strQueryId )
    {
        return JNEXT.invoke( self.m_strObjId, "GetColNames " + strQueryId );
    }
    
    self.getColTypes = function( strQueryId )
    {
        return JNEXT.invoke( self.m_strObjId, "GetColTypes " + strQueryId );
    }
    
    self.close = function()
    {
        strRes = JNEXT.invoke( self.m_strObjId, "Close" );
        strRes = JNEXT.invoke( self.m_strObjId, "Dispose" );
        JNEXT.unregisterEvents( self );
    }
    
    self.getId = function()
    {
        return self.m_strObjId;
    }
    
    self.init = function()
    {
        if ( !JNEXT.require( "jqdb" ) )
        {
            return false;
        }
        
        self.m_strObjId = JNEXT.createObject( "jqdb.jQDB" );
        if ( self.m_strObjId == "" )
        {
            alert( "error initializing sqlite3" );
            return false;
        }
        
        JNEXT.registerEvents( self );
    }
    
    self.m_strObjId = "";
    self.init();
}


module.exports = {
	createObject : function () {
		return new JNEXT.SQLite3DB();
	},
	/**
	 * Converts an SQL result object into a javascript array
	 * @param result {Object} The query result set
	 * @returns {Array} An array of objects representing the rows of the result set
	 */
	resultToArray: function(result) {
		if (result == null || result.length <= 0)
		{
			return [];
		}

		var colNames = result.getColNames();
		var out = [];
		while ((row = result.getRow()) != null)
		{
			var o = {};
			for (var i=0; i<colNames.length; i++)
			{
				o[colNames[i]] = row[i];
			}
			out.push(o);
		}

		return out;
	},
	
	/**
	 * Safely encode strings for SQL
	 * @param query {String} The unsafe query
	 * @returns {String} The safe query
	 */
	sqlSafe: function(query) {
		return query.replace(/'/g, "''");
	}
};

/**
 * Adds a format function to the String prototype
 * Ex: "Hello {0}".format("Joe") will return "Hello Joe"
 * @return {String} The formatted string
 */
String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

/**
 * Adds a SQL scrubbing function to the String prototype
 * Ex: "O'Neil".cleanSQL() will return "O''Neil"
 * 
 * @return {String} The scrubbed string
 */
String.prototype.scrubForSQL = function() {
    return this.replace(/'/g, "''");
}
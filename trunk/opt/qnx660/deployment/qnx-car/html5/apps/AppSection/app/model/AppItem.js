/*
 * Represents an item on the app section page
 * @author dkerr
 *
 * $Id: AppItem.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.model.AppItem', {
    extend: 'Ext.data.Model',

    config: {
       fields: [
   	    {name: "name", type: "string"},
   	    {name: "id",	type: "string"},
   	    {name: "pid",	type: "string"},
   	    {name: "wid",	type: "string"},
   	    {name: "status",type: "string", defaultValue: ""},
   	    {name: "icon",	type: "string"},
   	    {name: "group",	type: "string"},
   	    {name: "type",	type: "string"},
   	    {name: "uri",	type: "string"},
        {name: "safe", type: "boolean"}
       ],
    },
});

/*
 * Represents installed application
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.model.AppItem', {
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

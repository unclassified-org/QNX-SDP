/**
 * Represents an item on the media home page
 * @author mlapierre
 *
 * $Id: HomeItem.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Communication.model.HomeItem', {
   extend: 'Ext.data.Model',

   config: {
	  fields: [
		 {name: "label",		type: "string"},
		 {name: "cls",			type: "string"},
		 {name: "safe",			type: "boolean"},
		 {name: "available",	type: "boolean"},
		 {name: "event",		type: "string"},
	  ]
   },
});

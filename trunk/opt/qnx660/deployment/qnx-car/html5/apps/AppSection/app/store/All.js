/**
 * A generic store used to show ALL items.
 * @author dkerr
 *
 * $Id: All.js 8098 2014-01-14 21:16:18Z mlapierre@qnx.com $
 */
Ext.define('AppSection.store.All', {
	extend:'Ext.data.Store',
	requires:['AppSection.model.AppItem'],
	xtype:'all',

	config:{
		model:'AppSection.model.AppItem',
		sorters:['name'],
		filters:[
			{
				id:'group',
				property:'group',
				value:/^((?!system).)*$/
			},{
				id:'name',
				property:'name',
				value:/^((?!Rearview Camera).)*$/
			}
		]
	}
});      

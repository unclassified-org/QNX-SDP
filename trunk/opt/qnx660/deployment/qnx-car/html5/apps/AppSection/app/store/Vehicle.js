/**
 * A generic store used to show items from Vehicle category
 * @author dkerr
 *
 * $Id: Vehicle.js 8098 2014-01-14 21:16:18Z mlapierre@qnx.com $
 */
Ext.define('AppSection.store.Vehicle', {
	extend:'Ext.data.Store',
	requires:['AppSection.model.AppItem'],
	xtype:'vehicle',

	config:{
		model:'AppSection.model.AppItem',
		sorters:['name'],
		filters:[
			{
				id:'group',
				property:'group',
				value:'vehicle'
			},{
				id:'name',
				property:'name',
				value:/^((?!Rearview Camera).)*$/
			}
		]
	}
});      

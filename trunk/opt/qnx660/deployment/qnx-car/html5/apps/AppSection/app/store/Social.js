/**
 * A generic store used to show items from Social category
 * @author dkerr
 *
 * $Id: Social.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.store.Social', {
	extend:'Ext.data.Store',
	requires:['AppSection.model.AppItem'],
	xtype:'social',

	config:{
		model:'AppSection.model.AppItem',
		sorters:['name'],
		filters:[
			{
				id:'group',
				property:'group',
				value:'internet'
			}
		]
	}
});      

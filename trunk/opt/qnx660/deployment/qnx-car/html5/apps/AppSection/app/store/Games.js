/**
 * A generic store used to show items from Games category.
 * @author dkerr
 *
 * $Id: Games.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.store.Games', {
	extend:'Ext.data.Store',
	requires:['AppSection.model.AppItem'],
	xtype:'games',

	config:{
		model:'AppSection.model.AppItem',
		sorters:['name'],
		filters:[
			{
				id:'group',
				property:'group',
				value:'games'
			}
		]
	}
});      

/**
 * A generic store used to show media items from Media category
 * @author dkerr
 *
 * $Id: Media.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.store.Media', {
	extend:'Ext.data.Store',
	requires:['AppSection.model.AppItem'],
	xtype:'media',

	config:{
		model:'AppSection.model.AppItem',
		sorters:['name'],
		filters:[
			{
				id:'group',
				property:'group',
				value:'media'
			}
		]
	}
});      

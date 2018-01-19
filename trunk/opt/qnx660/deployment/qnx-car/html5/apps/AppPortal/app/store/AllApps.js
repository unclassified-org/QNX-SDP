/**
 * A generic store used to keep all installed apps
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.store.AllApps', {
	extend:'Ext.data.Store',
	requires:['AppBox.model.AppItem'],
	xtype:'all',

	config:{
		model:'AppBox.model.AppItem',
		sorters:['name']
	}
});      

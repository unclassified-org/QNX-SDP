/**
 * Store represents all files in a directory (including images, sidecart files and bar files)
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.store.View', {
	extend:'Ext.data.Store',
	config:{
		model:'AppBox.model.Entry'
	}
});
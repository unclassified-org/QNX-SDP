/**
 * Store represents app content of single directory on box.com
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.store.Apps', {
	extend:'Ext.data.Store',
	config:{
		model:'AppBox.model.Entry'
	}
});
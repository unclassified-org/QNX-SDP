/**
 * The abstract radio tuner view
 * @author lgreenway@lixar.com
 *
 * $Id: Tuner.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.Tuner', {
	extend: 'Ext.Panel',
	xtype: 'radioTunerView',
	
	requires: [
		'QnxCar.view.menu.ShowButton',
	],
	
	config: {
		layout: 'vbox',
		cls: 'media-panel',
	},
	
	initialize: function() {
		// Add the menu show button as the first child of the vbox
		// so that all view subclasses will have it.
		this.insert(0, {xtype: 'menuShowButton'});
	},
});
/**
 * A store used to show the settings picker
 * @author mlapierre
 *
 * $Id: MainMenu.js 4505 2012-10-01 21:55:03Z mlapierre@qnx.com $
 */
Ext.define('Navigation.store.SettingsPicker', {
	extend  : 'Ext.data.Store',
	requires: ['Navigation.model.MenuSetting'],

	config: {
	  model   : 'Navigation.model.MenuSetting',
	},
});
/**
 * A store that contains the history
 * @author mlapierre
 *
 * $Id: History.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.store.History', {
	extend: 'Ext.data.Store',
	requires: [
		'Navigation.model.RecentLocation',
		'Navigation.proxy.History'
	],

	config: {
		model: 'Navigation.model.RecentLocation',
		proxy: {
			type: 'car.navigation.history'
		},
		autoLoad: true
	}
});
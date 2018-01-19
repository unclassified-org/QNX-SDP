/**
 * Displays the weather panel 
 * @author mlapierre
 *
 * $Id: Weather.js 4809 2012-10-30 20:57:32Z mlapierre@qnx.com $
 */
Ext.define('Home.view.Weather', {
	extend: 'Ext.Panel',
	xtype: 'weatherWidget',

	config: {
		cls: 'home-weather',
		html: '<iframe id="weather" src="platform:///apps/WeatherNetwork.testDev_therNetworke376bba_/native/index-mini.htm"></iframe>'
	},

});
/**
 * Displays a progress bar
 * @author mlapierre
 *
 * $Id: ProgressBar.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Home.view.ProgressBar', {
	extend: 'Ext.Container',
	xtype: 'progressbar',

	config: {
		cls: 'progressbar',
		items: [{
			action: 'progressbarHighlight',
			cls: 'progressbar-highlight',
		}],
	},
});
/**
 * The main menu
 * @author mlapierre
 *
 * $Id: Menu.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.Menu', {
	extend: 'QnxCar.view.menu.PullDownMenu',
	xtype: 'menuView',

	requires: [
		'QnxCar.view.menu.StackedMenu',
		'Communication.view.menu.Main',
		'Communication.view.menu.CallLogs',
		'Communication.view.menu.Messages',
		'Communication.view.menu.AddressBook',
		'Communication.view.menu.ContactDetails',
		'Communication.view.menu.MessageDetails',
		'Communication.view.menu.MessageList',
	],

	config: {
		items: [
			{
				xtype: 'stackedMenu',
				items: [
					{
						xtype: 'menuMain'
					}
				]
			}
		]
	}
});
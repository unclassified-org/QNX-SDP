/**
 * Incaming call screen
 * @author mlytvynyuk
 *
 * $Id: Incoming.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.menu.Incoming', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuIncoming',

	config: {
		zIndex: 300,
		items: [
			{
				xtype: 'button',
				action: 'back',
				cls: 'menu-spacer menu-spacer-2'
			},{
				cls: 'menuIncoming menu-sub-right menu-sub-right-2',
				items: [
					{
						id: "dialingTitle",
						html: 'Incoming Call'

					},
					{
						id: "textContent",
						html: ''
					},
					{
						id: "contactLogo",
						html: ''
					},
					{
						id: "contactName",
						html: ''
					},
					{
						cls: "buttons",
						items: [
							{
								xtype:"button",
								id:"acceptBt"
							},
							{
								xtype:"button",
								id:"declineBt"
							}
						]
					}
				]
			}
		]
	}
});
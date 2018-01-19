/**
 * Dial Pad screen (menu) When user dialing out
 * @author mlytvynyuk
 *
 * $Id: DialingSheet.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.menu.DialingSheet', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuDialing',

	config: {
		zIndex: 300,
		items: [
			{
				xtype: 'button',
				action: 'back',
				cls: 'menu-spacer menu-spacer-2'
			},{
				cls: 'menuDialing menu-sub-right menu-sub-right-2',
				items: [
					{
						id: "dialingTitle",
						html: ''

					},
					{
						id: "textContent",
						html: ''
					},
					{
						id: "duration",
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
								id:"hangupBt",
								label:"hangup"
							}
						]
					}
				]
			}
		]
	}
});
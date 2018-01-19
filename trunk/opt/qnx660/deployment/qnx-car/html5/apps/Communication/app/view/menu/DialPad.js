/**
 * Dial Pad screen (menu)
 * @author mlytvynyuk
 *
 * $Id: DialPad.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.menu.DialPad', {
	extend:'QnxCar.view.menu.AbstractMenu',
	xtype:'menuDialPadView',

	requires: [
		'Communication.view.menu.DialingSheet',
	],

	config:{
		zIndex:200,
		items:[
			{
				xtype:'button',
				action:'back',
				cls:'menu-spacer menu-spacer-1'
			},
			{
				cls:'menu-list menu-sub-right menu-sub-right-1',
				items:[

					{
						xtype:'container',
						cls:[
							'dialButtonsConainer'
						],
						layout:{
							type:'vbox'
						},
						items:[
							{
								xtype:'container',
								layout:{
									type:'hbox'
								},
								items:[
									{
										xtype:'button',
										cls:'one',
										type:"dialpad",
										value: '1'
									},
									{
										xtype:'button',
										cls:'two',
										type:"dialpad",
										value: '2'
									},
									{
										xtype:'button',
										cls:'three',
										type:"dialpad",
										value: '3'
									}
								]
							},
							{
								xtype:'container',
								layout:{
									type:'hbox'
								},
								items:[
									{
										xtype:'button',
										cls:'four',
										type:"dialpad",
										value: '4'
									},
									{
										xtype:'button',
										cls:'five',
										type:"dialpad",
										value: '5'
									},
									{
										xtype:'button',
										cls:'six',
										type:"dialpad",
										value: '6'
									}
								]
							},
							{
								xtype:'container',
								layout:{
									type:'hbox'
								},
								items:[
									{
										xtype:'button',
										cls:'seven',
										type:"dialpad",
										value: '7'
									},
									{
										xtype:'button',
										cls:'eight',
										type:"dialpad",
										value: '8'
									},
									{
										xtype:'button',
										cls:'nine',
										type:"dialpad",
										value: '9'
									}
								]
							},
							{
								xtype:'container',
								layout:{
									type:'hbox'
								},
								items:[
									{
										xtype:'button',
										cls:'star',
										type:"dialpad",
										value: '*'
									},
									{
										xtype:'button',
										cls:'zero',
										type:"dialpad",
										value: '0'
									},
									{
										xtype:'button',
										cls:'hash',
										type:"dialpad",
										value: '#'
									}
								]
							}
						]
					},
					{
						xtype:'button',
						id:'callBtn'
					},
					/* Commented just for now
					{
						xtype:'button',
						id:'addtoContacts',
						config: {
							disabled:true
						}
					},
					*/
					{
						id:'phoneNumber',
						html: ''
					},
					{
						xtype:'button',
						id:'deleteNumber'
					}
				]
			}
		]
	}
});
/**
 * View to show license with Accept and Deny buttons
 *
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.view.License', {
    extend: 'Ext.Panel',
    xtype: 'licenseView',
	 config: {
		layout:'vbox',
		cls:'license_sheet',
		baseCls:'def_sheet',
        items: [
			{
				cls: 'license',
				id:'licenseText',
				html:'',
				flex:3,
				scrollable: {
					direction: 'vertical',
				}
			},
			{
				flex:1,
				layout: {
					type: 'hbox',
					align: 'center',
					pack: 'center'
				},
				items: [
					{
						xtype:'button',
						text:'Accept',
						id:'acceptBtn',
						cls:'def_button',
						action:'accept'
					},
					{
						xtype:'button',
						text:'Decline',
						id:'declineBtn',
						cls:'def_button',
						action:'decline'
					}
				]
			}
        ]
    },

	/**
	 *
	 * */
	setLicense: function (value) {
		// if true, make UNINSTALL button visible
		if(value) {
			this.down('#licenseText').setHtml(value);
		}
	}
});

/**
 * This view represent property of individual app
 *
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.view.App', {
    extend: 'QnxCar.view.menu.AbstractMenu',
    xtype: 'appView',
	require: [
		'AppBox.view.License'
	],
	 config: {
		layout:'card',
		animation:'slide',
		centered:false,
		modal:{transparent:true},
		baseCls:'def_sheet',
        items: [
			{
				baseCls:'app_sheet',
				layout: {
					type: 'vbox',
					align: 'center'
				},
				items:[
					{
						html:'',
						id:'appIcon'
					},
					{
						id:'appName',
						xtype:'label'
					},
					{
						html:'',
						id:'appDescription'
					},
					{
						xtype:'button',
						text:'INSTALL',
						id:'installBtn',
						cls:'def_button',
						action:'install'
					},
					{
						xtype:'button',
						text:'UNINSTALL',
						id:'uninstallBtn',
						cls:'def_button',
						hidden:true,
						action:'uninstall'
					}
				]
			}
			,{
				id:'licenseView',
				xtype:'licenseView'
			}
        ]
    },

	/**
	 * Function sets values on appropriate controls in App view
	 * @param app {Ext.data.Model} record containing application information required to be displayed in thisview
	 * */
	setAppDetails: function (app) {
		if(app) {
			this.down('#appName').setHtml(app.get('name'));
			this.down('#appDescription').setHtml(app.get('description'));
			//this.down('#appIcon').setSrc(app.get('iconBASE64'));
			this.down('#appIcon').setHtml('<img src="' + app.get('iconBASE64') + '"/>');
			// TODO add some logic to check if app installed and if yes show uninstall button
			this.down('#licenseView').setLicense(app.get('license'));
			this.setActiveItem(0);
		}
	},

	/**
	 * Function display license
	 * @param value {Boolean} try to display license, false to hide
	 * */
	showLicense:  function (value) {
		if(value){
			this.setActiveItem(1);
		} else {
			this.setActiveItem(0);
		}
	},

	/**
	 * Function trigger INSTALL/UNINSTALL button dased on event that app is installed
	 * @param value {Boolean} true app is installed, false is not installed
	 * */
	setAppInstalled: function (value) {
		// if true, make UNINSTALL button visible
		if(value) {
			this.down('#uninstallBtn').setHidden(false);
			this.down('#installBtn').setHidden(true);
		} else {
			this.down('#uninstallBtn').setHidden(true);
			this.down('#installBtn').setHidden(false);
		}
	}
});

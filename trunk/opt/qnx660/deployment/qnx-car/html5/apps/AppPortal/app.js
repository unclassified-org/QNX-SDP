/**
 * This is the application definition file
 * @author mlytvynyuk@qnx.com
 * $Id:$
 */

//Common components
Ext.Loader.setPath('QnxCar', 'file:///apps/common/ui-framework/sencha/');

Ext.Loader.setConfig({ enabled:true, disableCaching:false });

Ext.application({
	name:'AppBox',

	controllers:['Main'],
	models:['Entry','AppItem'],
	views:['Main','App','Browse'],
	stores:['Categories','View', 'Apps', 'AllApps'],

	launch:function () {
		Ext.Viewport.add([
			Ext.create('AppBox.view.Main'),
			Ext.create('AppBox.view.License')
		]);
	}
});

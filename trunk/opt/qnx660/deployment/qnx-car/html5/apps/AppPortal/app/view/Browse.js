/**
 * View to browse categories and display list of applications
 *
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.view.Browse', {
    extend: 'QnxCar.view.menu.AbstractMenu',
    xtype: 'browseView',
    config: {
		layout:'hbox',
        items: [
			{
				cls:'leftColumn',
				xtype:'panel',
				layout:'fit',
				items:[
					{
						cls:'qnxLogo'
					},
					{
						cls:'line1'
					},
					{
						xtype: 'list',
						id: 'catlist',
						store: 'Categories',
						itemTpl: '{name}',
						itemCls:'category-item',
						pressedCls:'category-item-pressed',
						selectedCls:'category-item-selected'
					}
				]
			},
			{
				xtype: 'dataview',
				id: 'navlist',
				store: 'Apps',
				itemCls:'home-item',
				inline:true,
				itemTpl: Ext.create('Ext.XTemplate',
					'<img src="{[values.iconBASE64]}" width="86" height="86">',
					'<h3>{title}</h3>',
					{
						compiled: true
					}
				)
			}
        ]
    }
});

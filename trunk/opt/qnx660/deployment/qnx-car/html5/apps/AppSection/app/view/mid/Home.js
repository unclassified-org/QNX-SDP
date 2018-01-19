/**
 * Mid profile Home view. Only allows switching between application categories
 * via the {@link AppSection.view.AppCategoryToolbar AppCategoryToolbar} and
 * swipe gestures on the {@link AppSection.view.AppCardStack AppCardStack}.
 * 
 * @author lgreenway@lixar.com
 *
 * $Id: Home.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('AppSection.view.mid.Home', {
   extend: 'AppSection.view.Home',

   requires: [
      'AppSection.view.AppCategoryToolbar',
      'AppSection.view.AppCardStack',
      'AppSection.view.ModalWindow',
   ],

   config: {
		layout: 'vbox',
		items: [
      		{
      			xtype: 'container',
      			layout: 'vbox',
      			items: [
					{
						xtype: 'appCategoryToolbar'
					},
					{
						xtype: 'appCardStack',
					},
      			]
      		},
			{
				xtype: 'modalwindow'
			}
      ]
  }
});
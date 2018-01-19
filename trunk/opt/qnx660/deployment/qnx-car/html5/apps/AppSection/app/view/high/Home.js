/**
 * High profile Home view. Includes the {@link AppSection.view.AppCarousel AppCarousel}
 * which allows animated swiping between application categories in addition to being able to use
 * {@link AppSection.view.AppCategoryToolbar AppCategoryToolbar} for navigation.
 * 
 * @author lgreenway@lixar.com
 *
 * $Id: Home.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('AppSection.view.high.Home', {
   extend: 'AppSection.view.Home',

   requires: [
      'AppSection.view.AppCategoryToolbar',
      'AppSection.view.AppCarousel',
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
						xtype: 'appCarousel',
					},
      			]
      		},
			{
				xtype: 'modalwindow'
			}
      ]
  }
});
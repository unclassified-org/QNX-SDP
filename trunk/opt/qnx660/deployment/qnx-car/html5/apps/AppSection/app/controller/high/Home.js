/**
 * The high profile Home controller.
 * @author lgreenway@lixar.com
 *
 * $Id: Home.js 4600 2012-10-12 17:29:59Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.controller.high.Home', {
	extend:'AppSection.controller.Home',

	config:{
		refs:{
			appCarousel:{
				selector:'appCarousel'
			}
		},
		control:{
			appCarousel: {
				activeitemchange: 'onAppCarouselChange'
			},
			categoryButton: {
				release:'onMenuButtonTap'
			}
		}
	},

	/**
	 * Controller initialization handler.
	 */
	launch:function () {
		this.callParent(arguments);
	},
	
	/**
	 * Event handler for handling tap on application section tabs
	 *
	 * @param button {Object} - Reference to the button clicked
	 * */
	onMenuButtonTap:function (button) {
		var buttonSet = this.getCategoryButtonSet();
		var c = this.getAppCarousel();

		c.setActiveItem(buttonSet.indexOf(button));
	},
	
	/**
	 * Handle changing index of carousel to make appropriate button highlighted
	 * */
	onAppCarouselChange:function (c, currObj) {
		var index = c.getItems().indexOf(currObj);
		var btnArray = this.getCategoryButtonSet().getItems();

		this.getCategoryButtonSet().setPressedButtons([btnArray.items[index].getId()]);
	}
});
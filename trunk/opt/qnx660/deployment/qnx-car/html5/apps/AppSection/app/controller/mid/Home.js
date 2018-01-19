/**
 * The Mid Home view controller.
 * 
 * @author lgreenway@lixar.com
 *
 * $Id: Home.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('AppSection.controller.mid.Home', {
	extend:'AppSection.controller.Home',

	config:{
		refs:{
			cardStack: {
				selector:'appCardStack'
			},
		},
		control:{
			categoryButton: {
				release: 'onMenuButtonTap'
			},
		}
	},

	/**
	 * Controller launch handler. Registers the swipe gesture event
	 * on the app card stack to allow switching of categories, similar
	 * to the carousel, but without animation.
	 */
	launch: function () {
		this.callParent(arguments);
		
		// Add the swipe handler to the card stack element.
		this.getCardStack().element.on('swipe', this.onCardStackSwipe, this);
	},
	
	/**
	 * Event handler for handling tap on application section tabs
	 *
	 * @param button {Object} - Reference to the button clicked
	 * */
	onMenuButtonTap: function (button) {
		var buttonSet = this.getCategoryButtonSet();
		var c = this.getCardStack();

		c.setActiveItem(buttonSet.indexOf(button));
	},
	
	/**
	 * Card stack swipe handler which allows users to use swipe gestures
	 * to navigate between neighbouring application categories.
	 * 
	 * @param e {Ext.event.Event} The swipe event.
	 */
	onCardStackSwipe: function(e) {
		var currIndex = this.getCardStack().getItems().indexOf(this.getCardStack().getActiveItem());
		var newIndex = currIndex;

		// Determine the direction of the swipe, and whether there's an app
		// category to swipe to in that direction.
		if(e.direction == 'left' &&
			 currIndex < this.getCardStack().getItems().length - 1)
		{
			newIndex = currIndex + 1;
		}
		else if(e.direction == 'right' &&
			currIndex > 0)
		{
			newIndex = currIndex - 1;
		}

		// Only update the app category toolbar and app card stack if the index
		// has changed.
		if(newIndex != currIndex)
		{
			// Set the app category toolbar pressed buttons
			this.getCategoryButtonSet().setPressedButtons(
				[
					this.getCategoryButtonSet().getItems().items[newIndex].getId()
				]
			);
			
			// Set the active app card in the card stack
			this.getCardStack().setActiveItem(newIndex);
		}		
	}
});
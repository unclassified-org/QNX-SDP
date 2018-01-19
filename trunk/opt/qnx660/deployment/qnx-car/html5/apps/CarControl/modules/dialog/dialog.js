/*

{
	type: "alert",
	title: "Some Title",
	showCloseX: true,
	css: {
		width: 400
	},
	body: {
		css: {
			padding: 15
		},
		content: "<strong>Testing</strong>"
	},
	buttons: [
		{
			text: "Ok",
			ignoreClose: true
			tap: function() {
				console.log("Button works");
			}
		}
	]
}

 */
function dialog(args) {
	var tmpDialog = new function() {
		var self = this;
		var dialogOverlay = {};
		var modalDialog = {}; // Dialog object

		///// PRIVATE METHODS /////

		/**
		 * Adds a button to the footer of the dialog
		 * 
		 * @param button {Object} the properties of the button:
		 * 
		 * 		{
		 * 			text: "" // The label of the button
		 * 			tap: function(){} // Function to execute when the button is tapped
		 * 		}
		 */
		var addButton = function(button) {
			// Create the button element and append it to the footer of the dialog
			var btn = $('<div class="formCtrlButton"><div class="innerWrapper"><span class="btnSegment segmentLeft"></span><span class="ctrlLabel">' + button.text + '</span><span class="btnSegment segmentRight"></span></div></div>').appendTo($(".footer", modalDialog));
			
			// Bind the specified function to the button
			btn.tap(function() {
				self.hide();

				// If a tap event was defined in the button parameters
				if(typeof button.tap != "undefined") {
					button.tap()
				}
				
				if(typeof button.ignoreClose == "undefined" && button.ignoreClose !== true) {
					self.close();
				}
			});
		}

		/**
		 * Centers the dialog to current viewport dimensions
		 */
		var centerDialog = function() {
			var overlayWidth = $("#dialogOverlay").width(); // Width of the current viewport
			var overlayHeight = $("#dialogOverlay").height(); // Height of the current viewport
			var dialogWidth = modalDialog.outerWidth(); // Full width (including borders) of the dialog
			var dialogHeight = modalDialog.outerHeight(); // Full height (including borders) of the dialog
			
			// Apply the necessary styles to center the dialog
			modalDialog.css({
				top: (overlayHeight / 2) - (dialogHeight / 2),
				left: (overlayWidth / 2) - (dialogWidth / 2)
			})
		}

		///// PUBLIC METHODS /////

		/**
		 * Opens a new dialog
		 */
		self.open = function() {
			// If the opaque overlay doesn't exist, create it
			if($("#dialogOverlay").length < 1) {
				// Append the overlay to the body element of the DOM
				dialogOverlay = $('<div id="dialogOverlay"></div>').appendTo("body");
				$("body").css("pointer-events", "none")
			}

			// Create the base element structure of the dialog
			modalDialog = $('<div class="dialogContainer"><div class="borderWrapper"><div class="contentContainer"><div class="header"><div class="title"></div><div class="btnClose"></div></div><div class="body"><div class="content"></div><div class="footer"></div></div></div></div></div>').appendTo("#dialogOverlay");

			modalDialog.wrap('<div class="dialogEscapeSpace" />');

			if(typeof args.css != "undefined") {
				modalDialog.css(args.css);
			}

			// If a title was provided, show it in the dialog
			if(typeof args.title != "undefined") {
				$(".header .title", modalDialog).text(args.title).show();
			}

			if(typeof args.showCloseX != "undefined" && args.showCloseX == true) {
				$(".header .btnClose", modalDialog).show().tap(function() {
					self.close();
				});
			}

			// If body content was provided, insert it into the body of the dialog
			if(typeof args.body != "undefined") {
				var bodyContent = $(".body .content", modalDialog);

				// If any styles were defined for the dialogs body, apply them
				if(typeof args.body.css != "undefined") {
					bodyContent.css(args.body.css);
				}

				if(typeof args.body == "object") {
					// Add the content to the dialog's body
					bodyContent.html(args.body.content);
				} else {
					// Add the content to the dialog's body
					bodyContent.html(args.body);
				}
			}

			// If button(s) were defined, add them to the dialog footer
			if(typeof args.buttons != "undefined") {
				$(".footer", modalDialog).show();

				// If an array of buttons was provided, loop through them
				if($.isArray(args.buttons)) {
					for(var buttonIndex = 0; buttonIndex < args.buttons.length; buttonIndex++) {
						addButton(args.buttons[buttonIndex]);
					}
				// If a single button is provided, add it
				} else {
					addButton(args.buttons);
				}
			// If no buttons are defined, but the dialog type is an "alert", generate a simple
			// close button in the footer of the dialog
			} else if(typeof args.type != "undefined" && args.type == "alert") {
				$(".footer", modalDialog).show();

				addButton({
					text: "Ok"
				});
			}

			// Center the dialog
			centerDialog();

			// Show the dialog
			modalDialog.css("opacity", "1");
		}

		// Hides the dialog stuff allowing the process to continue, but not blocking the UI in case an "loading"
		// animation is provided additional feedback to the user
		self.hide = function() {
			// If there are more than 1 dialog showing, only hide the current one leaving  the background overlay visible and any 
			// subsequent dialogs available to handle input.
			if($("#dialogOverlay .dialogContainer").length > 1) {
				modalDialog.hide();
			} else {
				// Hide everything including the overlay
				dialogOverlay.hide();
			}
		}

		/**
		 * Closes the dialog
		 */
		self.close = function() {
			// Remove the dialog from the DOM
			modalDialog.parent().remove();

			// If the last dialog was removed, destroy the opaque overlay also
			if($("#dialogOverlay .dialogContainer").length < 1) {
				$("#dialogOverlay").remove();
				setTimeout('$("body").css("pointer-events", "")', 1000);
			}
		}

		// Launch the dialog once all the code for it is loaded
		self.open();
	}
}
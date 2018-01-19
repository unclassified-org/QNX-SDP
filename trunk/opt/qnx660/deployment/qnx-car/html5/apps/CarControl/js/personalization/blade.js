// $Id: blade.js 6518 2013-06-12 14:13:53Z mlytvynyuk@qnx.com $

/**
 * Function hides a specific modal blade
 * 
 * @param modalBlade {Object} - a modal blade
 */
function hideModalBlade(modalBlade) {
	// Remove the "dead-space" place holder from the DOM for the provided modal blade
	$(".modalBladeEscapeSpace", modalBlade).remove();

	// Remove the "show" class which will trigger the CSS animation and delay for .25s before
	// removing the blade from the DOM
	modalBlade.removeClass("show").delay(300).queue(function() {
		// If this is the last modal frame/blade visible, also destroy the opaque modal background overlay
		if(modalBlade.parent().children().length < 2) {
			$("#bladeContainer").remove();
		} else {
			$(this).remove();
		}
	});
}
/**
 * Function updates modal blades used to display forms or select box control options
 * 
 * @param bodyContent {String | Object} -	this can either be a string reference to the element containing 
 * 											custom content or a select box object
 */
function updateModalBlade(bodyContent){
	var bladeContainer = $("#bladeContainer"); // Reference to the parent container of all the blades
	var selectedApppendedSelectItem = {}; // Used to reference the selected element of a select control list
	var modalBlade = $('.modalBlade');
	// Clear whatever existing content that may be in the body of the modal blade
	$(".body .content", modalBlade).empty();

	// Create the parent wrapper for all available options of the select box element
	$(".body .content", modalBlade).append('<ul class="selectOptions"></ul>');

	// For each option of the select box element
	$("option", bodyContent).each(function() {
		var optionClass = "";
		var appendedOption = {};

		// If the current iteration of the options loop matches the value of the select box
		if(bodyContent.val() === $(this).val()) {
			// Create the string required to apply the appropriate style to the list item to be appended
			// to the options list
			optionClass = ' class="selected"';
		}

		// Append and reference the select box option of the list
		var escapedName = htmlEscape($(this).text());
		appendedOption = $('<li' + optionClass + '>' + escapedName + '</li>').appendTo(".body .content .selectOptions", modalBlade);

		// If the item
		if(optionClass.length > 0) {
			selectedApppendedSelectItem = appendedOption;
		}

		// Append the select control's option value as a data attribute of the list item referenced above
		$.data(appendedOption[0], "selectedIndex", $(this).val());
	});

	// If there is a selected item from the list of options and the list is longer than 5 items
	if(selectedApppendedSelectItem.length > 0 && $(".body .content .selectOptions li", modalBlade).length > 5) {
		// If the selected item is initially displayed beyond the viewable area of the blade body (aka the body's viewport)
		if((selectedApppendedSelectItem.position().top + selectedApppendedSelectItem.outerHeight()) > $(".body", modalBlade).outerHeight()) {
			// Automatically scroll the body element so that the selected option in the list shows in the middle of the body's viewport
			$(".body", modalBlade).scrollTop((selectedApppendedSelectItem.position().top + (selectedApppendedSelectItem.outerHeight() / 2)) - ($(".body", modalBlade).outerHeight() / 2));
		}
	}

	// Delegate the click event to any option selected from the list
	$(".body .content .selectOptions", modalBlade).delegate("li", "tap", function() {
		// De-select any currently selected option from the list
		$(this).siblings().removeClass("selected");
		// Apply the highlight style to the currently selected option
		$(this).addClass("selected");

		// Create a reference to the last element of the options list
		var appendedOption = $(".body .content .selectOptions li.selected", modalBlade)[0];

		// Change the value of the select box to that selected by the user from the options list
		bodyContent.val($.data(appendedOption, "selectedIndex"));
		// Programmatically changing the value of a select box doesn't trigger the "onchange" event,
		// so we have to do it manually
		bodyContent.trigger("change");

		hideModalBlade(modalBlade);
	});
}
/**
 * Function generates modal blades used to display forms or select box control options
 * 
 * @param bodyContent {String | Object} -	this can either be a string reference to the element containing 
 * 											custom content or a select box object
 * @param title {String} - title to be used in the blade
 */
function showModalBlade(bodyContent, title) {
	var bladeContainer = $("#bladeContainer"); // Reference to the parent container of all the blades
	var selectedApppendedSelectItem = {}; // Used to reference the selected element of a select control list

	// If the parent modal container doesn't exist, add it to the DOM
	if(bladeContainer.length < 1) {
		bladeContainer = $('<div id="bladeContainer"></div>').prependTo("#personalization");
	}

	var modalBlade = $('<div class="modalBlade"><div class="innerWrapper"><div class="modalShadow"></div><div class="body"><h2 class="title"></h2><div class="content"></div></div></div></div>').appendTo(bladeContainer);

	// Reduce the width of any stacked blade - the more there are stacked, the smaller the width.
	modalBlade.css({
		// Subtract 1 from the bladeContainer children count in order to exclude the first modal in the stack
		"width": modalBlade.outerWidth() - (15 * (bladeContainer.children().length - 1))
	});

	// Show the modal blade elements
	bladeContainer.addClass("show")
	modalBlade.addClass("show");

	$('<div class="modalBladeEscapeSpace"></div>').css({
		left: -($(document).width() - modalBlade.outerWidth(true)),
		right: modalBlade.outerWidth(true)
	}).appendTo(modalBlade);

	// Create a delay in the event binding of this element to ensure the people who "double-tap"
	// controls don't prematurely close the modal frame. Example: tap #1 opens blade,
	// tap #2 (if in the escape space) closes blade.
	$(".modalBladeEscapeSpace", modalBlade).delay(250).queue(function() {
		$(this).tap(function() {
			hideModalBlade(modalBlade);
		});
	});

	// If a title is defined, show it, else, hide the element.
	if(title !== undefined) {
		$(".body .title", modalBlade).show().text(title);
	} else {
		$(".body .title", modalBlade).empty().hide();
	}
	//Update the body content of the modal blade
	updateModalBlade(bodyContent);
}
// $Id: forms.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
/****************************************************************
 * Change the UI of dropdowns to adopt a more stylized display
 ****************************************************************/
// Hide all form select boxes and insert a new display controller immediately before
$("select").each(function() {
	var selectedOption = $("option:selected", this).text();

	$(this).hide();
	$(this).before(
		'<span class="formCtrlDropdown">' +
			'<span class="center"><span class="ctrlLabel">' + selectedOption + '</span></span>' +
			'<span class="right"></span>' +
		'</span>'
	);

	// When the updated UI select box control is clicked
	$(this).prev().tap(function() {
		$(this).next().tap();
	});

	// Bind a change event to any select box control
	$(this).change(function() {
		var ctrl = $(this);
		// When the value of the select box has changed, find the associated
		// custom UI element and update it's value as well
		ctrl.prev().find(".ctrlLabel").text($("option:selected", ctrl).text());
	});
});
/****************************************************************/
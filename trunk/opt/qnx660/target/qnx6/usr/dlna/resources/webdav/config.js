//A JSON object that contains the string translations retrieved according to the user's language setting.
var languageFile = {};
//A JSON object that contains the string translations for the default language file (assumed to be English).
var defaultLanguageFile = {};
//The currently selected left navigation item.
var activeNav;

function navigateTo(params){
   window.location.href = $.param.fragment(window.location.href, params, 2);
}

//Get the value of a string given a key from the localized string translations.
//key: The key to retrieve a string for.
//getLong: Default false. If true, retrieve longValue from the translation object rather than value. longValue can be
//used to store longer text that shouldn't necessarily always be displayed.
function getString(key, getLong){
    if (languageFile[key]) {
        return (getLong) ? (languageFile[key].longValue) : (languageFile[key].value);
    }
    else 
        if (defaultLanguageFile[key]) {
            return (getLong) ? (defaultLanguageFile[key].longValue) : (defaultLanguageFile[key].value);
        }
        else {
            return "";
        }
}

//Replace the contents of all elements in html that have a "string" attribute with the matching value from the
//translation file.
//html: The HTML to perform the replacement on. 
function replaceStrings(html){
    var stringElements = $("[string]", html);
    
    stringElements.each(function(i){
        $(this).html(getString($(this).attr("string")));
    });
}

//Call a handler function for each element in html that has a "key" attribute to display data.
//html: The HTML to perform the replacement on.
//responseData: The data object to retrieve the data from.
//handler: The handler that should be called when an element with a "key" attribute is discovered. Handlers should
//have the function signature (element, key, data) where element is the affected element, key is the data's key,
//and data is the data collection object.
function replaceData(html, responseData, handler){
    var dataElements = $("[key]", html);
    dataElements.each(function(i){
        var dataElement = $(this);
        var value = responseData[dataElement.attr("key")];
        if (handler) {
            handler(dataElement, dataElement.attr("key"), value);
        }
        else {
            dataElement.html(value);
        }
        
    });
}

//A generic wrapper for making AJAX GET requests.
//url: The url to make the request to.
//params: A collection of objects to be passed as querystring arguments. Use the format {"key": value}. For example,
//[{"uuid": 1234}, {"example": true}] will be passed as ?uuid=1234&example=true in the querystring.
//callback: The callback to be called after the request finishes.
function makeGetRequest(url, params, callback){
    var urlParams = "";
    var separatorChar = "?";
    if (params) {
        $.each(params, function(i, value){
            urlParams += separatorChar + i + "=" + value;
            separatorChar = "&";
        });
    }
    showLoadingGraphic();
    $.get(url + urlParams, function(response){
        if (callback) {
            callback(response);
        }
        hideLoadingGraphic();
    });
}

//A generic wrapper for making AJAX POST requests.
//url: The url to make the request to.
//params: A collection of objects to be passed as querystring arguments. Use the format {"key": value}. For example,
//[{"uuid": 1234}, {"example": true}] will be passed as ?uuid=1234&example=true in the querystring.
//data: The data to be passed during the POST request.
//callback: The callback to be called after the request finishes.
function makePostRequest(url, params, data, callback){
    var urlParams = "";
    var separatorChar = "?";
    if (params) {
        $.each(params, function(i, value){
            urlParams += separatorChar + i + "=" + value;
            separatorChar = "&";
        });
    }
    showLoadingGraphic();
    $.post(url + urlParams, data, function(response){
        if (callback) {
            callback(response);
        }
        hideLoadingGraphic();
    });
}

function showLoadingGraphic(){
    $(".serverSettingsContentWrapper").addClass("loading");
}

function hideLoadingGraphic(){
    $(".serverSettingsContentWrapper").removeClass("loading");
}

//Clear the selection on the currently selected left navigation item and highlight the new one. Cancel the
//udpate timer if it exists.
//currentNav: The newly clicked navigation item.
function highlightNav(currentNav){
    if (activeNav) {
        activeNav.removeClass("current");        
    }	
    currentNav.addClass("current");
    activeNav = currentNav;
}

//Hide the folder selection dialog and populate an input with the user's selected directory.
//rowNumber: The number of the selected folder browse row. Used to track which input the user is working with. 
function selectDir(rowNumber){
    if ($("#dirPathDisplay").html()) {
        $("#pathInput" + rowNumber).val($("#dirPathDisplay").html());
        hideDialogOverlay();
    }
}

function createFolderBrowseDialog(){
    return '<div>\
		    <div class="boxHeader">\
		    	<span class="titleWrapper">\
		        	<span class="title">' + getString("selectfolder") + '</span>\
				</span>\
				<div class="clear" />\
		    </div>\
			<div id="dirPathDisplay" class="dirPathDisplay"></div>\
			<div id="dirDisplayContainer"></div>\
		</div>';
}

//The maximum height of the directory display area before it begins scrolling, in pixels.
function getWindowHeight() {
	var windowHeight = 50;
	 if (typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		windowHeight = window.innerHeight;
	  } else if (document.documentElement && document.documentElement.clientHeight) {
		//IE 6+ in 'standards compliant mode'
		windowHeight = document.documentElement.clientHeight;
	  } else if (document.body && document.body.clientHeight) {
		//IE 4 compatible
		windowHeight = document.body.clientHeight;
	  }		
	  return windowHeight;
}

//Generate HTML to display the list of directories, along with a breadcrumb and a link for the parent directory.
//response: The data containing the directory list.
//rootPath: The path of the previous directory.
//rootId: The id of the previous directory.
function populateDirs(response, rootPath, rootId){
    ($("#dirDisplayContainer")).removeClass("scroll");
	$("#dirDisplayContainer").css("height", "auto"); 
   var html = "";
    var responsePieces = response.split("\n");
    var platformSpecificSeparator = responsePieces[0];
    var dirDisplay = $("#dirPathDisplay");
    dirDisplay.attr("dirid", rootId);
    dirDisplay.html(rootPath);
    if (dirDisplay.attr("dirid") && rootPath && rootId) {
	var lastSlash = rootPath.lastIndexOf(platformSpecificSeparator);
        var lastPipe = rootId.lastIndexOf("|");
        //If rootPath matches the format of a file path (e.g. C:\), parentPath is everything from the start of the string
        //to the last \, beyond which is the id of the current directory.
        var parentPath = (rootPath.match(/^[A-Z]:\\$/)) ? ("") : (rootPath.substring(0, lastSlash));
        //If parentPath is now only a drive designation (e.g. C:), add the \ back on.
        if (parentPath.match(/^[A-Z]:$/)) {
            parentPath += "\\";
        }
        var parentId = rootId.substring(0, lastPipe);
        html += '<div class="parentDirRow" onclick="getDirs(\'' + parentPath.replace(/\\/g, "\\\\") + '\', \'' + parentId + '\', \'' + platformSpecificSeparator.replace(/\\/g, "\\\\") + '\')"><span class="parentDirIcon"></span><span>' + getString("parentdir") + '</span></div>';
    }
    else {
        html += '<div class="parentDirRow"></div>';
    }
    $.each(responsePieces, function(i, value){
        if (value.length > 1) {

	    // directory/file id is 3+ digits long
	    var ii = 3;
	    while ((value.charAt(ii) != "D" && value.charAt(ii) != "F") && ii < value.length) {
		ii = ii + 1;
	    }
			
	    var dirId = value.substring(0, ii);
            var fullId = dirId;
            if (rootId) {
                fullId = rootId + "|" + dirId;
            }

            var dirKey = value.charAt(ii);
            var dirPath = value.substring(ii + 1);
            var fullPath = dirPath;

            if (rootPath) {
                var separatorChar = (rootPath.lastIndexOf(platformSpecificSeparator) != rootPath.length - 1) ? (platformSpecificSeparator) : ("");
                fullPath = rootPath + separatorChar + dirPath;
            }
            if (dirKey == "D") {
                html += '<div class="dirRow" onclick="getDirs(\'' + fullPath.replace(/\\/g, "\\\\") + '\', \'' + fullId + '\', \'' + platformSpecificSeparator.replace(/\\/g, "\\\\") + '\')"><span class="dirIcon"></span><span>' + dirPath + '</span></div>';
	    }
        }
    });
    $("#dirDisplayContainer").html(html);
    //If the container is too tall, add the scroll class to it to prevent it from taking up too much real estate.
	var wHeight = getWindowHeight();
	var dirDisplayMaxHeight = wHeight - Math.round(wHeight/2) - $("#dirPathDisplay").outerHeight() - $("#dialogButtonContainer").outerHeight();
    if (parseInt($("#dirDisplayContainer").css("height")) > dirDisplayMaxHeight) {
        ($("#dirDisplayContainer")).addClass("scroll");
		if (dirDisplayMaxHeight < 150) dirDisplayMaxHeight = 150;
		$(".scroll").css("height", dirDisplayMaxHeight); 
    }
    else {
        ($("#dirDisplayContainer")).removeClass("scroll");
    }
}

//Add the active class to a button when the mouse is pressed.
function onButtonMouseDown(button){
    var button = $(button);
    button.addClass("active");
}

//Remove the active class from a button when the mouse is released.
function onButtonMouseUp(button){
    var button = $(button);
    button.removeClass("active");
}

function showActionButtons(){
    $("#actionButtonContainer").show();
    $("#spinnerContainer").hide();
}

function hideActionButtons(){
    $("#actionButtonContainer").hide();
    $("#spinnerContainer").show();
}

//Display a dialog overlay and opaque the background to prevent the user from interacting with the page until
//the dialog is closed.
//contentConstructor: The function to be called in order to populate the contents of the dialog.
//contentArgs: Arguments to be passed to the content constructor.
//buttons: A collection of buttons to include in the dialog. Buttons should be in the format {"text": text, "onclick":
//"onClickFunction()"}, where text is the text to be shown on the button and onclick is the function to be called
//when the button is clicked, expressed as a string ("onClickFunction()" rather than onClickFunction). 
function showDialogOverlay(contentConstructor, contentArgs, buttons, widthClass){
    var dialog = $("#dialogOverlay");
    if (dialog) {
        dialog.remove();
    }
    var body = $(document.body);
    var contentHtml = contentConstructor(contentArgs);
    var buttonHtml = makeButtons(buttons);
    var overlay = $("#overlay");
    if (overlay.length < 1) {
        body.append("<div id='overlay' class='overlay'></div>");
    }
    body.append('<div id="dialogOverlay" class="dialogWrapper ' + widthClass + '"> \
	<b class="dialogTop"><b class="d1"></b><b class="d2"></b><b class="d3"></b><b class="d4"></b></b> \
		<div class="dialogContentWrapper">\
			<div class="dialogContent">\
				' +
    contentHtml +
    '\
				<div class="dialogButtonContainer" id ="dialogButtonContainer">\
					' +
    buttonHtml +
    '\
				</div>\
				<div class="clear"></div>\
			</div>\
		</div>\
	<b class="dialogBottom"><b class="d4"></b><b class="d3"></b><b class="d2"></b><b class="d1"></b></b></div>');
    var dialog = $("#dialogOverlay");
    var dialogWidth = dialog.outerWidth();
    var left = (body.width() / 2) - (dialogWidth / 2);
    dialog.css("left", left);
    if (contentArgs && contentArgs.onstart) {
        contentArgs.onstart();
    }
}

//Iterate through the collection of buttons to produce the HTML for them.
//buttons: The collection of button objects.
function makeButtons(buttons){
    var buttonHtml = "";
    $.each(buttons, function(key, button){
        buttonHtml += '\
			<a class="actionbtnmd floatL" onclick="' + button.onclick + '" onmousedown="onButtonMouseDown(this)" onmouseup="onButtonMouseUp(this)">\
				<span class="actionbtn_l"></span>\
				<span class="actionbtn_c">' +
        button.text +
        '</span>\
				<span class="actionbtn_r"></span>\
			</a>';
    });
    return buttonHtml;
}

//Remove the dialog and opaque overlay.
function hideDialogOverlay(){
    var overlay = $("#overlay");
    overlay.remove();
    var dialog = $("#dialogOverlay");
    dialog.remove();
}

//A function to wrap retrieved JSON data in parentheses for eval-ing to prevent errors.
function parseJson(jsonData){
    return eval("(" + jsonData + ")");
}
var shares_alias_array;
var shares_path_array;
var shares_user_array;
var shares_rights_array;
var user_array;
var rights_user_array;
var rights_share_array;
var rights_mode_array;
var admin_user_name;
var admin_password;
var values_loaded=0;
var server_name;
var server_port;
var server_version;
var server_start_time;
var server_build_date;
var reserve_user_name = "Any";
var globalLanguage = "en";
var globalTwonkyserverUrl = "";
var shareToDelete;
var str_read_only = "Read-only";
var str_read_write = "read/write";

$(window).bind("hashchange", function(e){	
    $("#leftNavContainer").show();
	
	if (isServerRunning() == '0') {
		loadServerDown();
		highlightNav($("#nav_" + e.fragment));
		return;
	}
    
    switch (e.fragment) {
        case "":
        case "status":
            loadStatus();
            break;
        case "users":
            loadUsers();
            break;
	case "sharedfolders":
            loadSharedFolders();
            break;
	case "administration":
            loadAdministration();
            break;		
    }
    populateSettingsNav();
});

//Initialize the Settings application by first reading the user's language setting, then loading the language file
//and calling loadStatus.
function initPage(){
	getMetaInfo();	
	makeGetRequest("webdav-strings-en.json", {}, function(data){			
		defaultLanguageFile = parseJson(data);			
		if (globalLanguage == "en") {
			languageFile = parseJson(data);
			onLanguageFetched();
		}
		else {
			getLanguageFile(onLanguageFetched);
		}
	});
}

function populateSettingsNav() {
    if ($("#settingsNav").length == 0) {		
        makeGetRequest("settings-nav.htm", {}, function(response){
            var responseHtml = $(response);
            replaceStrings(responseHtml);
            $("a", "#nav").removeClass("active");
            $(".serverSettingsContentWrapper").removeClass("contentDisplay");
            $("#leftNavContainer").html(responseHtml);
        });
    }
}

function loadServerDown(){
	var responseHtml = "<div id=\"statusContainer\"> <div class=\"serverSettingsTitlebarWrapper\"> <div class=\"subHeader nomargin\"> <span class=\"subheaderTitle\">"+getString("server_unavailable")+"</span> </div> </div> <span class=\"titleWrapper\"><span class=\"title\">" + getString("server_unavailable_desc")+ "</span></span>";
	$(".serverSettingsContentWrapper").html(responseHtml);
}

function isServerRunning() {
	var response = getServerDetails();
	if (response.status != 200) {
		return '0';
	}
	return '1';
}

function loadStatus(){
	getMetaInfo();
	makeGetRequest("status.htm", {}, function(response){
        var responseHtml = $(response);        	
		replaceStrings(responseHtml);
		$("#servername",responseHtml).html(getServerName());
		$("#version",responseHtml).html(getServerVersion());
		$("#serveruptime",responseHtml).html(getServerStartTime());
		$("#serverbuilddate",responseHtml).html(getServerBuildDate());
		$("#port",responseHtml).html(getServerPort());
        $("#languagelist",responseHtml).html(getLanguageList());   		
        $(".serverSettingsContentWrapper").html(responseHtml);		
        highlightNav($("#nav_status"));       
    });
}

function loadUsers() {	
	makeGetRequest("users.htm", {}, function(response){
        var responseHtml = $(response);        
		replaceStrings(responseHtml);
		$("#userslist",responseHtml).html(getUserList());        
        $(".serverSettingsContentWrapper").html(responseHtml);		
        highlightNav($("#nav_users"));        
    });
}

function loadSharedFolders() {
	makeGetRequest("sharedfolders.htm", {}, function(response){
        var responseHtml = $(response);        
		replaceStrings(responseHtml);
		$("#sharedlist",responseHtml).html(getShareList());
        $(".serverSettingsContentWrapper").html(responseHtml);		
        highlightNav($("#nav_sharedfolders"));        
    });
}

function loadAdministration() {
	getMetaInfo();
	makeGetRequest("administrator.htm", {}, function(response){
        var responseHtml = $(response);
		replaceStrings(responseHtml);	
		$("#adminstatus",responseHtml).html(checkAdminAccess());
        $(".serverSettingsContentWrapper").html(responseHtml);
        toggleDisablePasswordCheckButton();
        highlightNav($("#nav_administration"));        
    });
}

function onLanguageFetched(){	
    replaceStrings($(document));
    $(window).trigger("hashchange");
}

function resetAdminAccount() {
	var request = loadXMLDoc("/rpc/webdav/reset_admin_account","");
	if (request.status != 200) {
		admin_user_name = admin;
		admin_password = admin;
		showDialog(getString("dialog_admin_acc_reset_failed"),"window.location.reload();");		
	}
	else
		showDialog(getString("dialog_admin_acc_reset_default"),"window.location.reload();");		
}

function reloadConfig() {
	var request = loadXMLDoc("/rpc/webdav/reload","");
	if (request.status != 200) {
		showDialog(getString("reload_failed"));
	} else {
		window.location.reload();
	}	
}

function getAdmin() {
	return loadXMLDoc("/rpc/webdav/get_admin_account","");
}

function getServerDetails() {
	return loadXMLDoc("/rpc/webdav/get_server_info","");
}

function updateAdminAccount() {
	var user = $("#adminuser").val();	
	var pass = $("#adminpassword").val();
	
	if (user==null || user=="") {		
		showDialog(getString("dialog_enter_valid_un"));
		return;
	}
		
	if (pass==null || pass=="") {
		showDialog(getString("dialog_enter_valid_pw"));
		return;
	}
	
	var request = loadXMLDoc("/rpc/webdav/update_admin_account?user="+user+"&pass="+pass,"");
	if (request.status < 200 && request.status > 300)
		showDialog(getString("dialog_admin_acc_could_not_update"));
	else {
		admin_user_name = user;
		admin_password = pass;
		showDialog(getString("dialog_admin_acc_update_success"), "window.location.reload();");				
	}
}

function disableAdminAccess() {
	if (admin_user_name.length <= 0) {
		showDialog(getString("dialog_admin_acc_already_disabled"));
		return;
	}
	var request = loadXMLDoc("/rpc/webdav/disable_admin_access","");
	if (request.status < 200 && request.status > 300)
		showDialog(getString("dialog_admin_acc_prob_disabling"));
	else {		
		getMetaInfo();
		admin_user_name = "";
		admin_password = "";
		showDialog(getString("dialog_admin_acc_disabled"), "window.location.reload();");
	}
}

function getShares() {
	var request = loadXMLDoc("/rpc/webdav/get_shares","");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
	}
	return request;
}


function addShareAndRights() {
	var alias = $("#shareAlias").val();
	var folder = $("#pathInput1").val();
	var user = $("#user").val();
	var right = $("#right").val();
	var result = 0;
	var validRights = 0;
	var enableAuth = 1;
	if (user.toLowerCase().trim() == reserve_user_name.toLowerCase()) {
		enableAuth = 0;
	}

	result = addShare(alias, folder)
	if (1 == result) {
		if (enableAuth == 1) {
			result = addRight(alias, user, right);
		} else {
			result = removeRight(alias);
		}
		if (1 == result) {
			showDialog(getString("dialog_share_added_success"),"window.location.reload()");				
		}
	}
}

function addShare(alias,path) {
	if (alias==null || alias=="") {
		showDialog(getString("dialog_enter_alias_name"));       	
		return 0;
	}
        	
	var lines = alias.split("\\");
	if (lines.length > 1) {
		showDialog(formatString(getString("dialog_invalid_share_name_2"),["\\"]));
		return 0;
	}

	var lines = alias.split("/");
	if (lines.length > 2) {
		showDialog(formatString(getString("dialog_invalid_share_name_1"),["/","/","/","/","/"]));
		return 0;
	}

	if (path==null || path=="") {
		showDialog(getString("dialog_enter_share_dir"));
		return 0;
	}

	if (alias.charAt(0) != '/')
		alias = '/' + alias;
	
	alias = encodeURIComponent(alias);
	path = encodeURIComponent(path);
	var request = loadXMLDoc("/rpc/webdav/add_share?alias="+alias+"&path="+path,"");
	if (request.status != 200) {
		showDialog(getString("dialog_invalid_share_path"));
		return 0;
	}
	return 1;
}

function deleteShare(share) {
	shareToDelete = encodeURIComponent(share);
	showDialogOverlay(function(){
		return formatString(getString("dialog_delete_share"),[share]);
	}, null, {
		1: {
			text: getString("delete"),
			onclick: "handleDeleteShareConfirm()"
		},
		2: {
			text: getString("cancel"),
			onclick: "hideDialogOverlay()"
		}
	});
}

function handleDeleteShareConfirm(){
	var request = loadXMLDoc("/rpc/webdav/delete_share?share="+shareToDelete+"&tmp=", "");
	if (request.status != 200) {
		showDialog(getString("dialog_failed_delete_share"));
	} else {
		window.location.reload();
	}
}

function getUsers() {
	var request = loadXMLDoc("/rpc/webdav/get_users","");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
	}
	return request;
}

function getCopyrightMessage() {
	var request = loadXMLDoc("/rpc/webdav/copyright_message","");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
	}
	return request.responseText;	
}

function highlightText(field) {
	if(field!=null) {
		field.focus();
		field.select();
	}
}

function handleKeyPress(event) {
	// escape key
	if (event.keyCode==27) {
		hideDialogOverlay();
	}
}

function promptUserDialog(msg, handler, ispassword){
var inputtype="text";
var inputvalue=msg;
if(ispassword) {
    inputtype = "password";
    inputvalue = "";
}
    showDialogOverlay(function(){
        return "<div>" + msg + "</div>"
			+ "<input  type=\""+inputtype+"\" id=\"promptInput\" align='center' type=\"text\" value=\"" + inputvalue + "\" onkeyup=\"handleKeyPress(event)\" onclick=\"highlightText(this)\"/>";
    }, null, {
        1: {
            text: getString("ok"),
            onclick: handler
        },
        2: {
            text: getString("cancel"),
            onclick: "hideDialogOverlay()"
        }
    });
}

function addUser() {	
	promptUserDialog(getString("enter_valid_un"),"userEntered()", false);
}

//add new user methods
var validUser;
function userEntered(){	
	var user = $("#promptInput").val();	
	if (user == getString("enter_valid_un")) {
		user = '';
	} else if (user.toLowerCase().trim() == reserve_user_name.toLowerCase()) {		
		showDialog(formatString(getString("dialog_reserve_user_name"),[reserve_user_name]));
		return;
	}	
	if (user.length > 0) {
		validUser = encodeURIComponent(user);
		promptUserDialog(getString("enter_valid_pw"),"passwordEntered()", true);
	} else {
		showDialog(getString("dialog_enter_valid_un"));
	}
}

function passwordEntered () {
	var pw = $("#promptInput").val();	
	if (pw == getString("enter_valid_pw")) {
		pw = '';
	} 
	if (pw.length > 0) {
		pw = encodeURIComponent(pw);
		var request = loadXMLDoc("/rpc/webdav/add_user?user=" + validUser + "&pass=" +pw,"");
		if (request.status != 200) {
			showDialog(getString("dialog_server_req_failed"));
		} else {
			showDialog(getString("dialog_user_add_success"),"window.location.reload()");			
		}
	} else {
		showDialog(getString("dialog_enter_valid_pw"));
	}
}

function updateUser(user,oldpw,newpw) {
	var request = loadXMLDoc("/rpc/webdav/update_user?user="+user+"&old="+oldpw+"&new="+newpw,"");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
	}	
}

function confirmDialog(msg,handler) {
    showDialogOverlay(function(){
        return msg;
    }, null, {
        1: {
            text: getString("ok"),
            onclick: handler
        },
        2: {
            text: getString("cancel"),
            onclick: "hideDialogOverlay()"
        }
    });
}

function confirmDeleteUser() {
	var user = $("#user").val();	
	user = encodeURIComponent(user);
	var request = loadXMLDoc("/rpc/webdav/delete_user?user="+user,"");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
	} else {
		updateSharesForUser(user);
		window.location.reload();
	}
}

function deleteUser() {
	var user = $("#user").val();
	var msg = formatString(getString("dialog_delete_user"),[user,user]);
	confirmDialog(msg,"confirmDeleteUser()");
}

function updateSharesForUser(user) {
	var len = shares_alias_array.length;
	var i = 0;
	for (i=0;i<len;i++) {
		if (shares_user_array[i].length <= 0) continue;
		if (shares_user_array[i] != user) continue;
		removeRight(shares_alias_array[i]);
	}
}

function getRights() {
	var request = loadXMLDoc("/rpc/webdav/get_rights","");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
	}
	return request;
}

function addRight(alias,user,mode) {
	if (alias.charAt(0) != '/')
		alias = '/' + alias;
	alias = encodeURIComponent(alias);
	user = encodeURIComponent(user);
	var request = loadXMLDoc("/rpc/webdav/add_right?alias="+alias+"&user="+user+"&mode="+mode,"");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
		return 0;
	}
	return 1;
}

function removeRight(alias) {
	alias = encodeURIComponent(alias);
	var request = loadXMLDoc("/rpc/webdav/remove_right?alias="+alias,"");
	if (request.status != 200) {
		showDialog(getString("dialog_server_req_failed"));
		return 0;
	}
	return 1;
}

function loadAll() {
	var rawdata=getShares().responseText;
	var lines=rawdata.split("\n");
	var numElems = 4;
	var len = parseInt(lines.length/numElems);
	shares_alias_array = new Array(len);
	shares_path_array = new Array(len);
	shares_user_array = new Array(len);
	shares_rights_array = new Array(len);
	for (i=0;i<len;i++) {
	    shares_alias_array[i]=lines[numElems*i];
	    shares_path_array[i]=lines[numElems*i+1];
	    shares_user_array[i]=lines[numElems*i+2];
		if (lines[numElems*i+3] == "r/o"){
			shares_rights_array[i] = str_read_only;
		} else 
			shares_rights_array[i]= str_read_write;
	}

	rawdata = getUsers().responseText;
	lines = rawdata.split("\n");
	len = lines.length-1;
	user_array = new Array(len);
	for (i=0;i<len;i++) {
	    user_array[i]=lines[i];
	}

	rawdata=getRights().responseText;
	lines=rawdata.split("\n");
	len = parseInt(lines.length/3);
	rights_user_array = new Array(len); 
	rights_share_array = new Array(len); 
	rights_mode_array = new Array(len); 
	for (i=0;i<len;i++) {
	    rights_user_array[i]=lines[3*i];
	    rights_share_array[i]=lines[3*i+1];
	    rights_mode_array[i]=lines[3*i+2];
	}
	values_loaded=1;
}

function openTwonkyServerConfig() {
	if (globalTwonkyserverUrl.length <= 0) {
		getTwonkyServerUrl();
	}

	if (globalTwonkyserverUrl.length > 0) {
		window.open(globalTwonkyserverUrl);
	} 
}

function getTwonkyServerUrl() {
	var request = loadXMLDoc("/rpc/webdav/get_twonkyserver_url","");
	if (request.status == 200) {
		globalTwonkyserverUrl = request.responseText;
	}
	return globalTwonkyserverUrl;
}

function getShareUrl(idx) 
{
	var url = shares_alias_array[idx];
	var lines = url.split("/");
	if (lines.length > 1) {		
		url = "/" + encodeURIComponent(lines[1]);
	}
	if (shares_alias_array[idx] != "/") {
	 url += "/";
	}
	return url;
}

function openShare(idx) {
	window.open(getShareUrl(idx));
}

function getShareList() {
	var i;
	var strOut = "";
	var newlink = "";
	if (!values_loaded) loadAll();
	var numSharesPresent = shares_alias_array.length;	

	if (numSharesPresent <= 0) {
		strOut += "<font color=\"red\">" + getString("no_shares") + "</font>";
	}
	else {	
		strOut += "<table class='mediaReceiversTable'><tr>"
				+ "<th>" + getString("share_name") + "</th>"
				+ "<th>" + getString("local_folder") + "</th>"
				+ "<th>" + getString("user_name") + "</th>"					
				+ "<th>" + getString("rights") + "</th></tr>";
		var uname = reserve_user_name;
		// Get the existing shares
		for (i=0;i<shares_alias_array.length;i++) {
   		   if (shares_user_array[i].length > 0)
			uname = shares_user_array[i];
		   else 
   			uname = reserve_user_name;
		
		    strOut += "<tr><td class=\"floatL\">" 
						+ shares_alias_array[i]
						+ "</td><td>" 						
						+ "<input class=\"longInput pathInput floatL\" type=\"text\" readonly=\"readonly\" value=\"" + shares_path_array[i] + "\"/>"
						+ "</td><td style='text-align:center;'> <span class=\"floatL\">"
						+ uname 
						+ "</span></td><td class=\"floatL\" style='text-align:center;'>" 
						+ shares_rights_array[i]
						+ "</td><td>"
						+ "<a class=\"actionbtn floatL\" onmousedown=\"onButtonMouseDown(this)\" onmouseup=\"onButtonMouseUp(this)\" onClick=\"deleteShare('"+ shares_alias_array[i] +"');\">"
						+ "<span class=\"actionbtn_l\"></span><span class=\"actionbtn_c\">" + getString('delete') + "</span><span class=\"actionbtn_r\"></span>"
						+ "</a></td>"
						+ "<td>"
						+ "<a class=\"actionbtn floatL\" onmousedown=\"onButtonMouseDown(this)\" onmouseup=\"onButtonMouseUp(this)\" onClick=\"openShare(" + i + ");\">"
						+ "<span class=\"actionbtn_l\"></span><span class=\"actionbtn_c\">" + getString('view') + "</span><span class=\"actionbtn_r\"></span>"
						+ "</a></td>"
						+ "</tr>"						
		}
		strOut += "</table>";		
	}
	strOut += "<div class=\"smallServerContentSpacer\"/>"
	strOut += "<div><b><span class=\"title\">" + getString("shared_folders_new_share_info") + "</span></div></b>";	
	strOut += "<table class='mediaReceiversTable'><tr>"
				+ "<th>" + getString("share_name") + "</th>"
				+ "<th>" + getString("local_folder") + "</th></tr>";
	strOut += "<tr><td>" 						
					+ "<input id=\"shareAlias\" class=\"pathInput floatL\" type=\"text\" value=\"\"/>"
					+ "</td><td>"
					+ "<input id=\"pathInput1\" readonly=\"readonly\" class=\"longInput pathInput floatL\" type=\"text\" value=\"\"/>"
					+ "</td><td>"
					+ "<a class=\"actionbtn floatL\" onmousedown=\"onButtonMouseDown(this)\" onmouseup=\"onButtonMouseUp(this)\" onClick=\"showFolderBrowse('1');\">"
					+ "<span class=\"actionbtn_l\"></span><span class=\"actionbtn_c\">" + getString("browse") + "</span><span class=\"actionbtn_r\"></span>"
					+ "</a></td><td>"
					+ "<select class=\"selectInput floatL\" id=\"user\">";
					for (i = 0; i < user_array.length; i++) {
						strOut += "<option " + ((i==0)?"selected ":"") + "value=\"" + user_array[i] + "\">" + user_array[i] + "</option>";
					} 
					strOut += "<option>" + reserve_user_name + "</option></select>"
					+ "</td><td>"
					+ "<select class=\" selectInput floatL\" id=\"right\">"
					+ "<option selected=\"selected\" value=\"r/w\">" + str_read_write + "</option>"
					+ "<option value=\"r/o\">" + str_read_only + "</option>"
					+ "</select></td></tr>";
	strOut += "</table>";
	return strOut;
}

function getUserList() {
	var i;
	var strOut = "";
	var numUsers = 0;
	if (!values_loaded) loadAll();
	numUsers = user_array.length
	
	if (numUsers <= 0) {
		strOut += "<font color=\"red\">" + getString("no_user_added") + "</font>";
	} else {
		strOut += "<select class=\"selectInput floatL\" id=\"user\">";
		for (i=0;i<numUsers;i++) {
			strOut += "<option "+((i==0)?"selected ":"")+"value=\""+user_array[i]+"\">"+user_array[i]+"</option>";
		}
		strOut += "</select> <a class=\"actionbtnmd bold\" onmousedown=\"onButtonMouseDown(this)\" onmouseup=\"onButtonMouseUp(this)\" onclick=\"deleteUser();\"> <span class=\"actionbtn_l\"></span><span class=\"actionbtn_c\">"+getString("delete")+"</span><span class=\"actionbtn_r\"></span></a>";

	}	
	return strOut;
}


function getMetaInfo() {
	var rawdata = getAdmin().responseText;	
	lines = rawdata.split("\n");
	admin_user_name = lines[0];	
	admin_password = lines[1];
	
	rawdata = getServerDetails().responseText;
	lines = rawdata.split("\n");
	server_name = lines[0];	
	server_port = lines[1];	
	server_version = lines[2];
	globalLanguage = lines[3]
	server_start_time = lines[4];
	server_build_date = lines[5];
}

function toggleDisablePasswordCheckButton() {
	var e = document.getElementById('disable_admin');
	var style = "hidden";
	
	if (null != e) {
		if (admin_user_name.length<=0) {
			style = "hidden"; 
		} else {
			style = "visible";
		}
		e.style.visibility = style; 
	}
}

function checkAdminAccess() {
	if (admin_user_name.length <= 0)
		return "<font color=\"red\">" + getString("authentication_not_enabled") + "<font>";
	else 
		return "<b>" + getString("authentication_enabled") + "</b>";
}

function getAdminName() {
	return admin_user_name;
}

function getServerName() {
	return server_name;
}

function getServerPort() {
	return server_port;
}

function getServerVersion() {
	return server_version;
}

function getServerStartTime() {
	return server_start_time;
}

function getServerBuildDate() {
	return server_build_date;
}

// Helper functions

// Helper function that does the actual RPC invocation
function loadXMLDoc(my_url,strData) 
{
	var req;
	req = false;
	// branch for native XMLHttpRequest object
	if(window.XMLHttpRequest) {
		try {
			req = new XMLHttpRequest();
		} catch(e) {
			req = false;
		}
		// branch for IE/Windows ActiveX version
		} else if(window.ActiveXObject) {
		try {
			req = new ActiveXObject("Msxml2.XMLHTTP");
		} catch(e) {
			try {
				req = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e) {
				req = false;
			}
		}
	}
	if(req) {
//		my_url = "http://127.0.0.1:9000" + my_url;
		if (strData.length>0) {  // post request
			req.open("POST", my_url, false);
			//req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			req.setRequestHeader('Content-Type', 'text/xml; charset=UTF-8');
			req.send(strData);
		}
		else { // get request
			req.open("GET", my_url, false);
			try {
				req.send("");
			} catch(e) {
				req = false;
			}
		}
		return req;
	}
	return "";
}

// Language menu uses this array in this order
var languages = new Array(12);
languages["en"]="English";
languages["de"]="Deutsch";
languages["fr"]="Francais";
languages["it"]="Italiano";
languages["es"]="Espa&ntilde;ol";
languages["nl"]="Nederlands";
languages["fi"]="Suomi";
languages["ru"]="&#x0440;&#x0443;&#x0441;&#x0441;&#x043a;&#x0438;&#x0439;";
languages["ko"]="&#xd55c;&#xad6d;&#xc5b4;";
languages["cht"]="&#x53e4;&#x6587;&#x0020;&#x002f;&#x0020;&#x6587;&#x8a00;&#x6587;";
languages["chs"]="&#x7b80;&#x4F53;&#x4e2d;&#x6587;";
languages["jp"]="&#x65e5;&#x672c;&#x8a9e;";

function getLanguageList() {
	var strLanguage = globalLanguage;
	var strOut = "<select class=\"selectInput floatL\" id=\"language\">"; 	
	
	for (lang in languages) {
		selected = "";
		if (strLanguage == lang)
			selected = "selected=\"selected\"";
		strOut += "<option " + selected + " value=\"" + lang + "\">" + languages[lang] + "</option>";				
	}	
	strOut += "</select>";
	return strOut;
}

function updateLanguage() {
	var lang = $("#language").val();	
	if (globalLanguage != lang)	{
		var request = loadXMLDoc("/rpc/webdav/set_language?lang="+lang,"");
		if (request.status == 200) {
			globalLanguage = lang;
			showDialog(getString("dialog_language_updated"), "window.location.reload();");
		}
	}              
}

function getLanguageFile(callback) {
	var request = loadXMLDoc("webdav-strings-" + globalLanguage + ".json","");	
	if (request.status == 200) {		
		makeGetRequest("webdav-strings-" + globalLanguage + ".json", {}, function(data){			
			languageFile = parseJson(data);
			if (callback) {
				callback();
			}
			return;
		});	
	} else {		
		showDialog(formatString(getString("dialog_can_not_load_lang"), [languages[globalLanguage]]));
		globalLanguage = "en";
	}	
	if (callback) {
		callback();
	}
}

//Display a dialog that allows the user to browse folders on his local machine. This can't be a browser control
//because browsers only allow file selection, not folder browsing.
//rowNumber: The number of the selected folder browse row. Used to track which input the user is working with.
function showFolderBrowse(rowNumber) {
    showDialogOverlay(createFolderBrowseDialog, {
        onstart: makeGetRequest("/rpc/webdav/getdir", {
            "path": ""
        }, function(response){
            populateDirs(response, "", "");
        })
    }, {
        1: {
            text: getString("select"),
            onclick: "selectDir('" + rowNumber + "')"
        },
        2: {
            text: getString("cancel"),
            onclick: "hideDialogOverlay()"
        }
    }, "folderBrowse");
}

//Get the directories under a given directory id.
//dirPath: The path of the previous directory to be used for breadcrumb navigation.
//dirId: The id to use for the new dirs call.
function getDirs(dirPath, dirId, platformSpecificSeparator){
    var passId = dirId.replace(/\|/g, platformSpecificSeparator)
    makeGetRequest("/rpc/webdav/getdir", {
        "path": passId
    }, function(response){
        populateDirs(response, dirPath, dirId);
    });
}

function showDialog(msg, handler){
	showDialogOverlay(function(){
		return msg;
		}, {}, {
			1: {
				text: getString("ok"),
				onclick: "hideDialogOverlay(); " + handler
			}				
	}); 
}

function formatString(string2Fmt, values){
	if (string2Fmt == null || values == null || values.length == 0)
		return;
	var len = values.length;
	for (i=0;i<=len;i++){
		string2Fmt = string2Fmt.replace("{" + i + "}", values[i]);
	}
	return string2Fmt;	
}

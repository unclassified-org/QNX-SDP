// the order of this array is important
var layouts = ["alphabetic", "numeric", "symbolic"],
	capsLock = false;

function handler(e) {
	var key = e.target;
	switch(key.className) {
		case 'letter service':
		case 'letter':
			alphaNumericHandler(key);
			break;
		case 'special':
			specialHandler(key);
			break;
		case 'service':
			serviceHandler(key);
			break;
		case 'number':
			alphaNumericHandler(key);
			break;
	}
}

function alphaNumericHandler(key) {
	if (key.id) {
		switch (key.id) {
			case 'spaceAlpha':
			case 'spaceNum':
			case 'spaceSym':
				keyPressChar(" ");
				break;
		}
	} else {
		var symbol = convertEntities(key.innerHTML);

		if(capsLock && key.className === 'letter') {
			symbol = symbol.toUpperCase();
		}
		keyPressChar(symbol);
	}
	resetCaps();
}

function specialHandler(key) {
	if (key.id) {
		switch (key.id) {
			case 'leftMoreNum':
			case 'rightMoreNum':
				showTable(layouts[2]); // symbolic
				break;
			case 'leftMoreSym':
			case 'rightMoreSym':
				showTable(layouts[1]); // numeric
				break;
			case 'leftShift':
			case 'rightShift':
				var alphabeticTable = document.getElementById(layouts[0]);
				alphabeticTable.classList.toggle('uppercase');
				capsLock = alphabeticTable.classList.contains('uppercase');
				break;
			case 'hideAlpha':
			case 'hideNum':
			case 'hideSym':
				resetCaps();
				hide();
				break;
			case 'language':
				break;
			case 'deleteAlpha':
			case 'deleteNum':
			case 'deleteSym':
				keyPressCode(61448); //DEC=61448, HEX=FOO8
				break;
		}
	}
}

function serviceHandler(key) {
	if (key.id) {
		switch (key.id) {
			case 'abcAlpha':
				showTable(layouts[1]); // numeric
				break;
			case 'abcNum':
			case 'abcSym':
				showTable(layouts[0]); // alphabetic
				break;
			case 'returnAlpha':
			case 'returnNum':
			case 'returnSym':
				keyPressCode(61453); //DEC=61453, HEX=FOOD
				break;
		}
	}
}

/**
 * Special case function converts some of HTML entities into real character
 * &lt; &gt; &amp; should be converted into < > &
 * as well as escape quotes
 * @param entity {String} entity or quotes
 * @return {String} escaped or escaped string
 * */
function convertEntities(entity) {
	var result = "";

	switch(entity) {
		case "&lt;": result="<"; break;
		case "&gt;": result=">"; break;
		case "&amp;": result="&"; break;
		case '"': result='\\"'; break; // looks like this because of funky business with WebWorks.
		case '\\': result='\\\\'; break; // has to be double escaped, because it will be escaped in line 190 one time, then next time during WebWorks serialisation.
		default: result = entity; break;
	}
	return result;
}

function resetCaps() {
	document.getElementById(layouts[0]).classList.remove('uppercase'); // alphabetic
	capsLock = false;
}

function showTable(id) {
	for (var index in layouts) {
		var table = document.getElementById(layouts[index]);
		table.style.display = 'none';
	}
	document.getElementById(id).style.display = '';
}

function hide(symbol) {
	qnx.callExtensionMethod('webview.executeJavaScript', -1, 'hide()',"NormalWorld");
}

function keyPressChar(symbol) {
	qnx.callExtensionMethod('webview.executeJavaScript', -1, 'keyPressChar("' + symbol + '")',"NormalWorld");
}

function keyPressCode(code) {
	qnx.callExtensionMethod('webview.executeJavaScript', -1, 'keyPressCode(' + code + ')',"NormalWorld");
}

function assignHandlers() {
	var cells = document.getElementsByTagName('td');

	for (var index in cells) {
		cells[index].ontouchstart = handler;
	}
}

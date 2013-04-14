function encode64(data) {
	for (var r = '', i = 0, n = data.length; i < n; i += 3)
		r += append3bytes(
			data.charCodeAt(i),
			i + 1 != n ? data.charCodeAt(i + 1) : 0,
			i + 2 != n ? data.charCodeAt(i + 2) : 0);
	return r;
}

function append3bytes(b1, b2, b3) {
	var c1 = b1 >> 2;
	var c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
	var c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
	var c4 = b3 & 0x3F;
	var r =
		encode6bit(c1 & 0x3F) +
		encode6bit(c2 & 0x3F) +
		encode6bit(c3 & 0x3F) +
		encode6bit(c4 & 0x3F);
	return r;
}

function encode6bit(b) {
	if (b < 10)
		return String.fromCharCode(48 + b);
	b -= 10;
	if (b < 26)
		return String.fromCharCode(65 + b);
	b -= 26;
	if (b < 26)
		return String.fromCharCode(97 + b);
	b -= 26;
	if (b == 0)
		return '-';
	if (b == 1)
		return '_';
	return '?';
}

function compress(s) {
	//UTF8
	s = unescape(encodeURIComponent(s));
	return encode64(deflate(s));
}

var defaultSettings = {
	server: 'http://www.plantuml.com/plantuml',
	reload: true,
	type: 'img'
};

function sanitizeUrl(url) {
	if (!url)
		return undefined;
	if (!/[a-zA-Z]+:\/\//.test(url))
		url = 'http://' + url;
	if (url.substr(-1) == '/')
		url = url.slice(0, -1);
	return url;
}

function sanitizeType(type) {
	if (['img', 'svg', 'txt', 'none'].indexOf(type) == -1)
		return 'img';
	return type;
}

function readSettings() {
	return {
		server: sanitizeUrl(localStorage['server'] || defaultSettings.server),
		reload: localStorage['reload'] !== 'false',
		type: sanitizeType(localStorage['type'] || defaultSettings.type)
	};
}

function writeSettings(settings) {
	settings['server'] = sanitizeUrl(settings['server']);
	for (var x in defaultSettings)
		if (settings[x] !== undefined && settings[x] !== defaultSettings[x])
			localStorage[x] = settings[x];
		else
			localStorage.removeItem(x);
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {
			command: 'savedSettings',
			settings: readSettings()
		})
	});
}

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		/*console.log(request);
		var oldSendResponse = sendResponse;
		sendResponse = function() {
			console.log.apply(console, arguments);
			oldSendResponse.apply(this, arguments);
		}*/

		var command = request && request.command;
		switch (command) {
			case 'showPageAction':
				chrome.pageAction.show(sender.tab.id);
				sendResponse();
				break;
			case 'compress':
				sendResponse({
					data: compress(request.data),
					settings: readSettings()
				});
				break;
			case 'readSettings':
				sendResponse(readSettings());
				break;
			case 'writeSettings':
				writeSettings(request.data);
				sendResponse();
				break;
			default:
				sendResponse();
		}
	}
);

function $(id) {
	return document.getElementById(id);
}

chrome.extension.sendRequest({ command: 'readSettings' }, function(response) {
	$('server').value = response.server;
	$('reload').checked = response.reload;
});

$('save').onclick = function() {
	var request = {
		command: 'writeSettings',
		data: {
			server: $('server').value,
			reload: $('reload').checked
		}
	};
	chrome.extension.sendRequest(request, function() { });
	close();
}

$('reset').onclick = function() {
	var request = {
		command: 'writeSettings',
		data: new Object
	};
	chrome.extension.sendRequest(request, function() { });
	close();
}

$('close').onclick = function() {
	close();
}
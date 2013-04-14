var form = document.forms[0];

chrome.extension.sendRequest({ command: 'readSettings' }, function(response) {
	form.server.value = response.server;
	form.reload.checked = response.reload;
	for (var i = 0, n = form.type.length; i < n; ++i)
		if (form.type[i].value == response.type) {
			form.type[i].checked = true;
			break;
		}
});

form.save.onclick = function() {
	for (var i = 0, n = form.type.length; i < n; ++i)
		if (form.type[i].checked) {
			type = form.type[i];
			break;
		}
	var request = {
		command: 'writeSettings',
		data: {
			server: form.server.value,
			reload: form.reload.checked,
			type: type.value
		}
	};
	chrome.extension.sendRequest(request, function() { });
	close();
}

form.reset.onclick = function() {
	var request = {
		command: 'writeSettings',
		data: new Object
	};
	chrome.extension.sendRequest(request, function() { });
	close();
}

form.close.onclick = function() {
	close();
}

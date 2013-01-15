if (!document.doctype &&
		document.documentElement.namespaceURI == 'http://www.w3.org/1999/xhtml' &&
		document.body.textContent.substr(0, '@startuml'.length) == '@startuml') {
	chrome.extension.sendRequest({
		command: 'showPageAction'
	});
	var reload = true, shown = false;
	var request = {
		command: 'compress',
		data: document.body.textContent
	}
	document.body.innerHTML = '<img id="im" />';

	var show = function() {
		shown = true;
		chrome.extension.sendRequest(request, function(response) {
			document.getElementById('im').src = response.settings.server + 'img/' + response.data;
		});
	}

	if (location.protocol == 'file:') {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status != 404 && (!shown || request.data != xhr.responseText)) {
				request.data = xhr.responseText;
				show();
			}
		};
		var update = function() {
			if (reload) {
				xhr.abort();
				xhr.open('GET', location.href + '?t=' + +new Date, true);
				xhr.send(null);
			}
			chrome.extension.sendRequest({ command: 'readSettings' }, function(response) {
				reload = response.reload;
			});
		};
		setInterval(update, 1000);
		update();
	} else
		show();
}

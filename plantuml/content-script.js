if (!document.doctype &&
		document.documentElement.namespaceURI == 'http://www.w3.org/1999/xhtml' &&
		document.body.textContent.substr(0, '@start'.length) == '@start') {
	chrome.extension.sendRequest({
		command: 'showPageAction'
	});
	var data = document.body.textContent;
	var reload = true;
	var shown = false;
	var type = 'none';

	function escapeHtml(text) {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	var showXhr;
	var show = function(force) {
		shown = shown || force;
		if (showXhr)
			showXhr.abort();

		chrome.extension.sendRequest({ command: 'compress', data: data }, function(response) {
			var url = [
				response.settings.server,
				response.settings.type,
				response.data
			].join('/');

			switch (response.settings.type) {
				case 'img':
					document.body.innerHTML = ['<img id="im" src="', escapeHtml(url), '" />'].join('');
					break;

				case 'svg':
					//document.body.innerHTML = ['<img id="im" src="', escapeHtml(url), '" />'].join('');
          document.body.innerHTML = ['<object data="', escapeHtml(url), '" type="image/svg+xml"> Fail </object>'].join('');
					break;

				case 'txt':
					document.body.innerHTML = '';
					showXhr = new XMLHttpRequest();
					showXhr.onreadystatechange = function() {
						if (showXhr.readyState == 4 && showXhr.status != 404) {
							document.body.innerHTML = ['<pre>' + escapeHtml(showXhr.responseText) + '</pre>'].join('');
						}
					}
					showXhr.open('GET', url);
					showXhr.send(null);
					break;

				default:
				case 'none':
					document.body.innerHTML = ['<pre>' + escapeHtml(data) + '</pre>'];
					break;
			}
		});
	}

	if (location.protocol == 'file:') {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status != 404 && (!shown || data != xhr.responseText)) {
				data = xhr.responseText;
				show(true);
			}
		};
		var update = function() {
			if (!shown || reload) {
				xhr.abort();
				xhr.open('GET', location.href + '?t=' + +new Date, true);
				xhr.send(null);
			}
		};
		setInterval(update, 1000);
		update();
	} else
		show(true);

	chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse) {
			/*console.log(request);
			var oldSendResponse = sendResponse;
			sendResponse = function() {
				console.log.apply(console, arguments);
				oldSendResponse.apply(this, arguments);
			}*/

			var command = request && request.command;
			switch (command) {
				case 'savedSettings':
					reload = request.settings.reload;
					show();
					break;
			}
			sendResponse();
		}
	);
}

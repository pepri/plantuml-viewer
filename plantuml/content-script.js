
if(document.body.textContent.substr(0, '@startuml'.length) == '@startuml') {
	translateUml(document.body);
}

var c = document.querySelectorAll('code');
var i;
for (i = 0; i < c.length; i++) {
    if(c[i].textContent.substr(0, '@startuml'.length) == '@startuml') {
    	translateUml(c[i])
    }
}

function translateUml(element) {
	chrome.extension.sendRequest({
		command: 'showPageAction'
	});

	var data = element.textContent;
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
					element.innerHTML = ['<img id="im" src="', escapeHtml(url).replace(/^http:/, "https:"), '" />'].join('');
					break;

				case 'svg':
					element.innerHTML = ['<img id="im" src="', escapeHtml(url).replace(/^http:/, "https:"), '" />'].join('');
					break;

				case 'txt':
					element.innerHTML = '';
					showXhr = new XMLHttpRequest();
					showXhr.onreadystatechange = function() {
						if (showXhr.readyState == 4 && showXhr.status != 404) {
							element.innerHTML = ['<pre>' + escapeHtml(showXhr.responseText) + '</pre>'].join('');
						}
					}
					showXhr.open('GET', url);
					showXhr.send(null);
					break;

				default:
				case 'none':
					element.innerHTML = ['<pre>' + escapeHtml(data) + '</pre>'];
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

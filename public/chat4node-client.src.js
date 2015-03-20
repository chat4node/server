(function() {
    // The Barchart namespace
    if (!window.chat4node) window.chat4node = {};
    if (!window.chat4node.Client) window.chat4node.Client = {}
}());

chat4node.Client = function() {
	var _socket = null;
	var _callback = null;

	function admin(action, options, callback) {

		if (typeof(options) == 'function') {
			console.log('here');
			_callback = options;
			options = {};
		}
		else
			_callback = callback;
console.log(options);
		options.action = action;

		_socket.emit('admin', options);
	}

	function connect(options, callback) {
		_socket = io('http://' + options.hostname, {'transports' : ['websocket']});

		_socket.on('admin', function(data) {
			if (_callback)
				_callback(data);
			_callback = null;
		});

		_socket.on('login', function(data) {
			if (data.status == 'failed')
				_socket.disconnect();
			callback(data);
		});

		_socket.on('welcome', function(data) {
			_socket.emit('login', { username: options.username, password: options.password });
		});
	}

	return {
		admin : admin,
		connect : connect
	}
}


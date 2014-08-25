(function($, io) {

	io = io.connect('http://stopthespies-api.herokuapp.com');

	io.on('views', function(reps) {
		console.log('views', reps);
	});

	io.on('calls', function(reps) {
		console.log('calls', reps);
	});

	io.on('emails', function(reps) {
		console.log('emails', reps);
	});

	io.on('tweets', function(reps) {
		console.log('tweets', reps);
	});

	io.on('facebooks', function(reps) {
		console.log('facebooks', reps);
	});

})(jQuery, io);

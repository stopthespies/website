(function($, io) {

	io = io.connect('http://booty:5000');

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

	io.on('googlepluses', function(reps) {
		console.log('googlepluses', reps);
	});

})(jQuery, io);

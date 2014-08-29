// socket.io application object
(function($, io) {

	io = io.connect('http://stopthespies-api.herokuapp.com:80');

	io.on('get_stats', function(stats) {
		STS.events.onStatsLoad(stats[0]);	// :NOTE: array of records comes back from API
	});

	io.on('get_tweets', function(tweets) {
		STS.events.onTweetsLoad(tweets);
	});

	io.on('legislator_stats', function(stats) {
		STS.events.onLegislatorStats(stats);
	});

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

	// EXPORTS
	STS.app = io;

})(jQuery, io);

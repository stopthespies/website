// socket.io application object
(function($, io) {

	io = io.connect('<%= site.config['api_url'] %>');

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
		STS.events.onLegislatorStatsIncrement(reps, 'views');

	});

	io.on('calls', function(reps) {
		console.log('calls', reps);
		STS.events.onLegislatorStatsIncrement(reps, 'calls');
	});

	io.on('emails', function(reps) {
		console.log('emails', reps);
		STS.events.onLegislatorStatsIncrement(reps, 'emails');
	});

	io.on('tweets', function(reps) {
		console.log('tweets', reps);
		STS.events.onLegislatorStatsIncrement(reps, 'tweets');
	});

	io.on('facebooks', function(reps) {
		STS.events.onLegislatorStatsIncrement(reps, 'facebooks');
		console.log('facebooks', reps);
	});

	// EXPORTS
	STS.app = io;

})(jQuery, io);

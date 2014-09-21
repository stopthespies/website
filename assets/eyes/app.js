(function($) {
	$(function() {


		/**
		 * Settings
		 */


		// Display settings
		var render_framerate = 17;

		// Animation settings
		var eye_open_delay = 0.1;


		/**
		 * Properties
		 */


		// Rendering
		var canvas;
		var ctx;
		var render_timer;

		// Display
		var eyes = [];


		/**
		 * Initialisation
		 */
		initialiseEyes();


		/**
		 * Initialise eyes
		 */
		function initialiseEyes() {

			// Get canvas element and context; check support
			canvas = document.getElementById('eyes');
			if (!canvas.getContext) return;
			ctx = canvas.getContext('2d');

			// Initialise eyes
			eyes.push(new Eye(100, 100, 1.0, 500, 400));
			eyes.push(new Eye(300, 100, 0.8, 500, 400));
			eyes.push(new Eye(500, 100, 1.0, 500, 400));
			eyes.push(new Eye(700, 100, 0.9, 500, 400));
			eyes.push(new Eye(900, 100, 1.0, 500, 400));
			eyes.push(new Eye(100, 300, 0.7, 500, 400));
			eyes.push(new Eye(300, 300, 1.0, 500, 400));
			eyes.push(new Eye(500, 300, 1.1, 500, 400));
			eyes.push(new Eye(700, 300, 1.0, 500, 400));
			eyes.push(new Eye(900, 300, 0.9, 500, 400));
			eyes.push(new Eye(100, 500, 1.0, 500, 400));
			eyes.push(new Eye(300, 500, 1.0, 500, 400));
			eyes.push(new Eye(500, 500, 0.7, 500, 400));
			eyes.push(new Eye(700, 500, 1.0, 500, 400));
			eyes.push(new Eye(900, 500, 0.8, 500, 400));
			eyes.push(new Eye(100, 700, 1.0, 500, 400));
			eyes.push(new Eye(300, 700, 0.9, 500, 400));
			eyes.push(new Eye(500, 700, 1.0, 500, 400));
			eyes.push(new Eye(700, 700, 0.7, 500, 400));
			eyes.push(new Eye(900, 700, 1.1, 500, 400));

			// Show eyes and start rendering
			showEyes();

		}


		/**
		 * Show/hide eyes
		 */
		function showEyes() {

			// Open eyes in random order
			var eyes_open = eyes.slice();
			var open_t = 0;
			while (eyes_open.length) {
				var eye_open = eyes_open.splice(Math.floor(Math.random() * eyes_open.length), 1);
				eye_open[0].setOpen(1, open_t += eye_open_delay, function() {

					// Start blinking on open
					this.startBlink();

				});
			}

			// Start rendering
			startRenderEyes();

		}
		function hideEyes() {

			// Close eyes in random order
			var eyes_open = eyes.slice();
			var open_t = 0;
			while (eyes_open.length) {
				var eye_open = eyes_open.splice(Math.floor(Math.random() * eyes_open.length), 1);

				// Stop blinking and close; stop rendering on last eye closed
				eye_open[0].stopBlink();
				eye_open[0].setOpen(0, open_t += eye_open_delay, (!eyes_open.length? stopRenderEyes : undefined));

			}

		}


		/**
		 * Start/stop rendering
		 */
		function startRenderEyes() {

			// Check if rendering
			if (render_timer !== undefined) return;

			// Initialise render timer
			render_timer = setInterval(renderEyes, render_framerate);
			renderEyes();

		}
		function stopRenderEyes() {

			// Check if rendering
			if (render_timer === undefined) return;

			// Stop render timer
			clearInterval(render_timer);
			render_timer = undefined;

			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

		}


		/**
		 * Render eyes
		 */
		function renderEyes() {

			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Render eyes
			$.each(eyes, function(ei, eye) {
				eye.render(ctx);
			});

		}


	});
})(jQuery);

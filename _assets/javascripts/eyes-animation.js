/**
 * Eye class
 */


/**
 * Constructor
 */
var Eye = function(x, y, scale, focus_x, focus_y) {

	// Set position, scale and focus position
	this._x = x;
	this._y = y;
	this._scale = scale;
	this._focus_x = focus_x;
	this._focus_y = focus_y;

	// Initialise display settings
	this._width = Eye.MIN_WIDTH + Math.random() * (Eye.MAX_WIDTH - Eye.MIN_WIDTH);
	this._height = Eye.MIN_HEIGHT + Math.random() * (Eye.MAX_HEIGHT - Eye.MIN_HEIGHT);
	this._c_height = Eye.MIN_CORNER_HEIGHT + Math.random() * (Eye.MAX_CORNER_HEIGHT - Eye.MIN_CORNER_HEIGHT);
	this._c_size = Eye.MIN_CURVE_SIZE + Math.random() * (Eye.MAX_CURVE_SIZE - Eye.MIN_CURVE_SIZE);
	this._p_size = Eye.MIN_PUPIL_SIZE + Math.random() * (Eye.MAX_PUPIL_SIZE - Eye.MIN_PUPIL_SIZE);
	this._p_offset = Eye.MIN_PUPIL_OFFSET + Math.random() * (Eye.MAX_PUPIL_OFFSET - Eye.MIN_PUPIL_OFFSET);
	this._open = 0;

	// Initialise animation settings
	this._open_speed = Eye.MIN_OPEN_SPEED + Math.random() * (Eye.MAX_OPEN_SPEED - Eye.MIN_OPEN_SPEED);
	this._blink_speed = Eye.MIN_BLINK_SPEED + Math.random() * (Eye.MAX_BLINK_SPEED - Eye.MIN_BLINK_SPEED);

}


/**
 * Open/close eye
 */
Eye.prototype.setOpen = function(open, delay, onComplete) {

	// Animate open
	if (this._open_tw) this._open_tw.kill();
	var tw_opts = {
		ease: 'Cubic.easeOut',
		delay: (delay || 0),
		_open: open
	};
	if (onComplete && $.isFunction(onComplete)) {
		tw_opts.onComplete = onComplete;
		tw_opts.onCompleteScope = this;
	}
	this._open_tw = new TweenLite(this, this._open_speed, tw_opts);

}


/**
 * Blink eye
 */
Eye.prototype.blink = function(delay, onComplete) {

	// Animate open
	if (this._open_tw) this._open_tw.kill();
	this._open = 1;
	var tw_opts = {
		ease: 'Cubic.easeIn',
		delay: (delay || 0),
		_open: 0,
		onComplete: function() {this.reverse();}
	};
	if (onComplete && $.isFunction(onComplete)) {
		tw_opts.onReverseComplete = onComplete;
		tw_opts.onReverseCompleteScope = this;
	}
	this._open_tw = new TweenLite(this, this._blink_speed, tw_opts);

}


/**
 * Start/stop blink
 */
Eye.prototype.startBlink = function() {

	// Check if blinking
	if (this._blink_timer !== undefined) return;

	// Start blink timer
	(function(self) {
		self._blink_timer = setTimeout(function() {
			self.blink();
			self._blink_timer = undefined;
			self.startBlink();
		}, Math.floor(Eye.MIN_BLINK_DELAY + Math.random() * (Eye.MAX_BLINK_DELAY - Eye.MIN_BLINK_DELAY)));
	})(this);

}
Eye.prototype.stopBlink = function() {

	// Check if blinking
	if (this._blink_timer === undefined) return;

	// Stop blink timer
	clearTimeout(this._blink_timer);
	this._blink_timer = undefined;

}


/**
 * Render to canvas
 */
Eye.prototype.render = function(ctx) {

	// Check if open
	if (!this._open) return;

	// Render eye body
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = Eye.FILL_COLOUR;
	ctx.beginPath();
	ctx.moveTo(
		this._x - this._scale * (this._width / 2),
		this._y - this._scale * (this._height / 2) + this._scale * (this._c_height * this._height)
	);
	ctx.bezierCurveTo(
		this._x - this._scale * (this._width / 2) + this._scale * (this._c_size * this._width),
		this._y - this._scale * (this._height / 2 * this._open),
		this._x + this._scale * (this._width / 2) - this._scale * (this._c_size * this._width),
		this._y - this._scale * (this._height / 2 * this._open),
		this._x + this._scale * (this._width / 2),
		this._y - this._scale * (this._height / 2) + this._scale * (this._c_height * this._height)
	);
	ctx.bezierCurveTo(
		this._x + this._scale * (this._width / 2) - this._scale * (this._c_size * this._width),
		this._y + this._scale * (this._height / 2 * this._open),
		this._x - this._scale * (this._width / 2) + this._scale * (this._c_size * this._width),
		this._y + this._scale * (this._height / 2 * this._open),
		this._x - this._scale * (this._width / 2),
		this._y - this._scale * (this._height / 2) + this._scale * (this._c_height * this._height)
	);
	ctx.fill();

	// Get pupil focus angle
	var f_angle = Math.atan2(this._focus_y - this._y, this._focus_x - this._x);

	// Render pupil
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = Eye.FILL_COLOUR;
	ctx.beginPath();
	ctx.arc(
		this._x + this._scale * (Math.cos(f_angle) * this._p_offset),
		this._y + this._scale * (Math.sin(f_angle) * this._p_offset),
		this._scale * (this._p_size / 2),
		0, Math.PI * 2
	);
	ctx.fill();

	// Reset canvas context
	ctx.globalCompositeOperation = 'source-over';

}


/**
 * Settings
 */


// Display settings
Eye.MIN_WIDTH = 100;
Eye.MAX_WIDTH = 120;
Eye.MIN_HEIGHT = 70;
Eye.MAX_HEIGHT = 80;
Eye.MIN_CORNER_HEIGHT = 0.5;
Eye.MAX_CORNER_HEIGHT = 0.5;
Eye.MIN_CURVE_SIZE = 0.25;
Eye.MAX_CURVE_SIZE = 0.35;
Eye.MIN_PUPIL_SIZE = 30;
Eye.MAX_PUPIL_SIZE = 35;
Eye.MIN_PUPIL_OFFSET = 15;
Eye.MAX_PUPIL_OFFSET = 15;
Eye.FILL_COLOUR = '#FFFFFF';

// Animation settings
Eye.MIN_OPEN_SPEED = 0.4;
Eye.MAX_OPEN_SPEED = 0.6;
Eye.MIN_BLINK_SPEED = 0.2;
Eye.MAX_BLINK_SPEED = 0.3;
Eye.MIN_BLINK_DELAY = 3000;
Eye.MAX_BLINK_DELAY = 10000;


/**
 * Eye animation
 */
(function($) {
	$(function() {


		/**
		 * Settings
		 */


		// Rendering
		var render_framerate = 17;
		var render_timer;

		// Animation settings
		var eye_open_delay = 0.1;


		/**
		 * Initialisation
		 */
		initialiseEyes();


		/**
		 * Initialise eyes
		 */
		function initialiseEyes() {

			// Initialise eyemarks sections
			$('.eyemarks').each(function() {
				var $marks = $(this);

				// Check for eye canvas
				var $canvas = $marks.closest('section').find('.eyecanvas');
				if (!$canvas.length) return true;
				var data = {};
				$canvas.data('display', data);

				// Get canvas element and context; check support
				data.canvas = $canvas.get(0);
				if (!data.canvas.getContext) return true;
				data.ctx = data.canvas.getContext('2d');

				// Replace eye images
				data.eyes = [];
				$marks.find('img').each(function() {
					var $img = $(this);
					$img.css('visibility', 'hidden');
					data.eyes.push(new Eye(
						$img.offset().left - $canvas.offset().left + ($img.width() / 2),
						$img.offset().top - $canvas.offset().top + ($img.width() / 2 * 0.52),
						($img.hasClass('sm')? 0.45 : 0.70),
						$marks.offset().left - $canvas.offset().left,
						$marks.offset().top - $canvas.offset().top
					));
				});

				// Show eyes on scroll to canvas
				var showEyesCanvas = function() {
					showEyes(data.eyes);
					ScrollHandler.removeTrigger(showEyesCanvas);
				}
				ScrollHandler.addTrigger($canvas, showEyesCanvas);

			});

			// Start rendering
			startRenderEyes();

		}


		/**
		 * Show/hide eyes
		 */
		function showEyes(eyes) {

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

		}
		function hideEyes(eyes) {

			// Close eyes in random order
			var eyes_open = eyes.slice();
			var open_t = 0;
			while (eyes_open.length) {
				var eye_open = eyes_open.splice(Math.floor(Math.random() * eyes_open.length), 1);

				// Stop blinking and close
				eye_open[0].stopBlink();
				eye_open[0].setOpen(0, open_t += eye_open_delay);

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

			// Render eye canvases
			$('.eyecanvas').each(function() {
				var data = $(this).data('display');

				// Clear canvas
				data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);

				// Render eyes
				$.each(data.eyes, function(ei, eye) {
					eye.render(data.ctx);
				});

			});

		}


	});
})(jQuery);

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
Eye.FILL_COLOUR = '#000000';

// Animation settings
Eye.MIN_OPEN_SPEED = 0.4;
Eye.MAX_OPEN_SPEED = 0.6;
Eye.MIN_BLINK_SPEED = 0.2;
Eye.MAX_BLINK_SPEED = 0.3;
Eye.MIN_BLINK_DELAY = 3000;
Eye.MAX_BLINK_DELAY = 10000;


(function($) {


	// Public members
	var plugin = {


		// Plugin namespace
		namespace: 'numberSpinner',


		/**
		 * Initialise
		 * @param options - initialisation options
		 */
		initialise: function(options) {

			// Initialise options
			options = $.extend(true, {}, _defaults, options);

			// Initialise elements
			return this.each(function() {
				var $this = $(this);

				// Check for plugin data, cancel if initialised
				if ($this.data(plugin.namespace)) return true;

				// Initialise data
				var instanceOptions = $.extend(true, {}, options),
				data = {
					options: instanceOptions,
					elements: {}
				};
				$this.data(plugin.namespace, data);

				// Initialise elements
				_private.initialiseElements.call($this);

			});

		},


		/**
		 * Destroy
		 */
		destroy: function() {
			return this.each(function() {
				var $this = $(this),
				data = $this.data(plugin.namespace);

				// Check for plugin data, cancel if uninitialised
				if (!data) return true;

				// Remove elements and data
				_private.removeElements.call($this),
				$this.removeData(plugin.namespace);

			});
		},


		/**
		 * Set number
		 * @param number - number to set spinner to
		 * @param animate - animate spinner, default: true
		 */
		set: function(number, animate) {
			return this.each(function() {
				var $this = $(this),
				data = $this.data(plugin.namespace);
				
				// Render number
				_private.renderNumber.call($this, number, (animate !== false));

			});
		}


	},


	// Private members
	_private = {


		/**
		 * Initialise elements
		 */
		initialiseElements: function() {
			return this.each(function() {
				var $this = $(this),
				data = $this.data(plugin.namespace);

				// Get initial value
				var val = parseInt($this.text());

				// Create and add tile wrapper
				data.elements.tile_wrapper = $('<span />', {'class': data.options.tile_wrapper_class}),
				$this.empty().append(data.elements.tile_wrapper);

				// Set initial value
				if (!isNaN(val)) plugin.set.call($this, val, false);

			});
		},


		/**
		 * Remove elements
		 */
		removeElements: function() {
			return this.each(function() {
				var $this = $(this),
				data = $this.data(plugin.namespace);

				// Remove tile wrapper
				data.elements.tile_wrapper.remove();

			});
		},


		/**
		 * Render number
		 * @param number - new number
		 * @param animate - animate spinner, default: true
		 */
		renderNumber: function(number, animate) {
			return this.each(function() {
				var $this = $(this),
				data = $this.data(plugin.namespace);

				// Get spinner length and current width
				var length = number.toString().length,
				from_width = $this.width();

				// Prepend tiles to fill spinner
				while (data.elements.tile_wrapper.find('.' + data.options.tile_class).length < length) {
					var $tile = $('<span />', {'class': data.options.tile_class}),
					$digits = $('<span />', {'class': data.options.digit_wrapper_class}),
					di;
					for (di = 0; di < 11; ++di) {
						$digits.prepend($('<span />', {
							'class': data.options.digit_class,
							'text': (di % 10)
						}));
					}
					$tile.append($digits),
					data.elements.tile_wrapper.prepend($tile);
				}

				// Move tiles to position
				var $tiles = data.elements.tile_wrapper.find('.' + data.options.tile_class),
				tile_height = $tiles.eq(0).height(), tile_offset = -(tile_height * 10);
				$tiles.each(function(ti, tile) {

					// Get tile, digits wrapper and tile data
					var $tile = $(tile),
					$digits = $tile.find('.' + data.options.digit_wrapper_class),
					tile_data = $tile.data(plugin.namespace);
					if (!tile_data) {
						tile_data = {offset: 0},
						$tile.data(plugin.namespace, tile_data);
					}

					// Get tile offset
					var offset = Math.floor(number / Math.pow(10, $tiles.length - ti - 1));
					
					// Animate tiles if animating
					if (animate !== false) {
						tile_data.tw = new TweenLite(tile_data, data.options.spin_duration, {
							ease: data.options.spin_ease,
							offset: offset,
							onUpdate: function() {
								$digits.css('top', tile_offset + (this.offset % 10) * tile_height);
							},
							onUpdateScope: tile_data
						});
					}

					// Set tile position if not animating
					else {
						$digits.css('top', tile_offset + (offset % 10) * tile_height),
						tile_data.offset = offset;
					}

				});

				// Trim or hide excess tiles
				for (var ti = 0; ti < $tiles.length - length; ti++) {
					if (animate !== false) $tiles.eq(ti).css('display', 'none');
					else $tiles.eq(ti).remove();
				}

				// Resize wrapper if animating
				if (animate !== false) {

					// Get new width, reset current width, show excess tiles
					var to_width = $this.width();
					$this.width(from_width),
					$tiles.removeAttr('style');

					// Animate
					$this.stop().animate({'width': to_width}, {
						duration: data.options.resize_duration,

						// Remove styles and trim excess tiles on complete
						always: function() {
							$this.removeAttr('style');
							for (var ti = 0; ti < $tiles.length - length; ti++) {
								$tiles.eq(ti).remove();
							}
						}

					});
					
				}

			});
		}


	},


	// Default options
	_defaults = {

		// Element settings
		tile_wrapper_class: 'tiles',
		tile_class: 'tile',
		digit_wrapper_class: 'digits',
		digit_class: 'digit',

		// Animation settings
		spin_duration: 1.5,
		spin_ease: 'Quad.easeInOut',
		resize_duration: 300

	};


	// jQuery facade
	$.fn.numberSpinner = function() {

		// Call method
		if (arguments.length && typeof arguments[0] == 'string') {
			if ($.isFunction(plugin[arguments[0]])) return plugin[arguments[0]].apply(this, Array.prototype.slice.call(arguments, 1));
			else $.error('$.fn.' + plugin.namespace + ': Method \'' + arguments[0] + '\' does not exist');
		}

		// Initialise
		else {
			return plugin.initialise.apply(this, arguments);
		}

	}


})(jQuery);

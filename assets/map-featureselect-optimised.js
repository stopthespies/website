L.FeatureSelectDelayedCls = L.FeatureSelect.extend({
	initialize: function (options) {
		this._checkIntersections = debounce(this._checkIntersections);

		L.FeatureSelect.prototype.initialize.apply(this, arguments);
	}
});

L.FeatureSelectDelayed = function (options) {
  return new L.FeatureSelectDelayedCls(options);
};

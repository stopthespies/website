(function($) {

$(function() {
	// load up map when page is ready
	window.CampaignMap.init();
});

var MAP_ELEMENT = '#campaign-map';
var DEFAULT_COORDS = [-29.043981, 134.912109];
var DEFAULT_ZOOM = 4;

//------------------------------------------------------------------------------
// setup

var map;
var mapAreas;
var featureSelect;

function initMap(el)
{
	map = L.map($(MAP_ELEMENT)[0]).setView(DEFAULT_COORDS, DEFAULT_ZOOM);

	//var mapBG = L.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png', {
	var mapBG = L.tileLayer('', {
		//attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
		attribution: '',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20
	}).addTo(map);

	$.ajax({
		url: '/map/electorates.json',
		dataType: "json",
		data: {},
		success: function(geojson) {
			showElectorates(geojson);
		}
	});
}

function showElectorates(geojson)
{
	mapAreas = L.geoJson(geojson, {
		style : function(feature) {
			// :TODO: finalise pallete and hookup to legislator data
			var colors = [
				'#fff',
				'#fff',
				'#fff'
			];
			var picked = colors[Math.floor(Math.random() * colors.length)];

			var style = {
				weight: 1,
				opacity: 1,
				fillOpacity: Math.min(1, 0.1 + Math.random()),
				color: picked,
				fillColor: picked
			};

			feature.__defaultStyle = style;	// reference here for use in callbacks

			return style;
		},
		onEachFeature: function(feature, layer) {
			layer.on("mouseover touchstart", function (e) {
				onFocusWard.call(layer, e, feature);
			});
			layer.on("mouseout touchend", function (e) {
				onBlurWard.call(layer, e, feature);
			});
		}
	}).addTo(map);
}

//------------------------------------------------------------------------------
// layer event callbacks (context is leaflet layer object)

function onFocusWard(e, feature)
{
	var style = $.extend({}, feature.__defaultStyle);
	style.color = style.fillColor = '#F0F';
	this.setStyle(style);
}

function onBlurWard(e, feature)
{
	this.setStyle(feature.__defaultStyle);
}

//------------------------------------------------------------------------------
// exports

window.CampaignMap = {
	init : initMap
};

})(jQuery);

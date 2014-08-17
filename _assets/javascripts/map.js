//= require vendor/Leaflet.FeatureSelect/js/feature-select.js
//= require map-featureselect-optimised

(function(jQuery) {

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

	var mapBG = L.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20
	}).addTo(map);

	$.ajax({
		url: '/map/COM20111216_ELB_region.json',
		dataType: "json",
		data: {},
		success: function(geojson) {
			showElectorates(geojson);
			bindSelector();
		}
	});
}

function showElectorates(geojson)
{
	mapAreas = L.geoJson(geojson, {
		style : function(feature) {
			// :TODO: finalise pallete and hookup to legislator data
			var colors = [
				'#D3CEAA',
				'#8E001C',
				'#1D8E00'
			];
			var picked = colors[Math.floor(Math.random() * colors.length)];
			return {
	            weight: 1,
	            opacity: 1,
	            fillOpacity: Math.random(),
	            color: picked,
	            fillColor: picked
	        };
		}
	}).addTo(map);
}

function bindSelector()
{
	featureSelect = L.FeatureSelectDelayed({
		featureGroup: mapAreas,
		selectSize: [16, 16]
	}).addTo(map);

	// :TODO:

	featureSelect.on('select', function(evt) {
		var layer;
		for (var i = 0; i < evt.layers.length; i++) {
			layer = evt.layers[i];
			console.log('focus electorate:', layer.feature.properties.ELECT_DIV, layer.feature.properties.STATE);
		}
	});
	featureSelect.on('unselect', function(evt) {

	});
}

//------------------------------------------------------------------------------
// exports

window.CampaignMap = {
	init : initMap
};

})($);

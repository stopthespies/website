/**
 * Notes on the map animation:
 *
 * - Placing the map in the correct screen location is a pain, because map zoom is very coarse.
 *   We measure the bounds of what we want to fit, then set the map to contain that. From there
 *   we transform the map as a whole to increase its size to the exact dimensions needed.
 * - The map has to be animated by transforming the root map element or others above it.
 *   Otherwise leaflet internally tries to adjust its layer positions and messes everything up.
 * - The map position is controlled by GSAP tweens, and can't be modified by directly manipulating
 *   its CSS. Not sure of a better way to do this.
 * - I've had to place all map transforming on the map node itself, which basically means we have
 *   to deal with the coordinate system ourselves.
 * - When you apply more than one GSAP tween to an element at once, it gets pretty weird about it.
 *   There must be a way to make it work, or we could just avoid their documentation and work around it.
 *
 * It would be great to rethink this whole thing and find a more elegant solution, the complexity
 * is getting a bit out of control.
 *
 * :TODO: create dom markers and measure offsets, then recompute tween based on their positions
 * :TODO: use different tweens for different width screens as needed
 * :TODO: resizing the window doesn't put the map in the correct place for some weird reason, you have
 *        to scroll before it's placed correctly.
 */

(function($, STS) {

$(function() {
  // load up map when page is ready
  STS.CampaignMap.init();
});

var MAP_ELEMENT = '#campaign-map';
var DEFAULT_COORDS = [-28.043981, 134.912109];
var DEFAULT_ZOOM = 4;

// used to force leaflet to make the whole map visible
var COUNTRY_BOUNDS = L.latLngBounds(L.latLng(-43.660984, 157.060547), L.latLng(-10.469086, 110.302734));

//------------------------------------------------------------------------------
// setup

STS.MAP_ELEMENT = MAP_ELEMENT;  // for use in map-movement.js

var mapEl;
var map;
var mapAreas;
var featureSelect;

var winW = $(window).width();
var winH = $(window).height();

var mapScrollTween;  // TimelineMax instance linked to scoll pos
var mapEnterTween;

var mapFitScale, mapProjectionBounds;    // base scale to apply to map


function initMap(el)
{
  mapEl = $(MAP_ELEMENT);
  mapDOM = mapEl[0];

  map = L.map(mapDOM, {
    scrollWheelZoom: false
  }).setView(DEFAULT_COORDS, DEFAULT_ZOOM);

  STS.CampaignMap.deactivateUI();

  $.ajax({
    url: '/map/electorates.json',
    dataType: "json",
    data: {},
    success: function(geojson) {
      showElectorates(geojson);
    }
  });

  // mapEl.find('.map-blocker').on('click', activateUI);
}

function showElectorates(geojson)
{
  recalculateMapTransforms(COUNTRY_BOUNDS);

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

      feature.__defaultStyle = style; // reference here for use in callbacks

      return style;
    },
    onEachFeature: function(feature, layer) {
      // layer.on("mouseover touchstart", function (e) {
      //   onFocusWard.call(layer, e, feature);
      // });
      // layer.on("mouseout touchend", function (e) {
      //   onBlurWard.call(layer, e, feature);
      // });
      // layer.on("dblclick", function(e) {
      //   map.setZoomAround(e.latlng);
      //   map.zoomIn(1);
      // });
    }
  }).addTo(map);

  mapEnterTween.play();
}

// :TODO: make this animated (will need to fix leaflet fitBounds() method)
// :TODO: restore original position after the bounds have been projected (not yet necessary)
function recalculateMapTransforms(bounds)
{
  // first, zoom the map as appropriate
  map.fitBounds(bounds, { reset: true });

  var mapDims = [ mapEl.width(), mapEl.height() ];

  // now, measure the actual pixel bounds we've ended up at since zoom is very coarse
  var ne = map.project(bounds.getNorthEast());
  var sw = map.project(bounds.getSouthWest());

  var topBounds = map.getPixelOrigin();

  var projectionCoords = {
    top: ne.y - topBounds.y,
    left: sw.x - topBounds.x,
    bottom: sw.y - topBounds.y,
    right: ne.x - topBounds.x
  };

  // now that we have projected screenspace coords we can determine our scale mutiplier to exactly fit..
  var projectionSize = [ projectionCoords.right - projectionCoords.left, projectionCoords.bottom - projectionCoords.top ];
  var scaleAdjust = Math.min(mapDims[0] / projectionSize[0], mapDims[1] / projectionSize[1]);

  mapProjectionBounds = projectionCoords;
  mapFitScale = scaleAdjust;

  regenerateMapTweens();
}

// percentage offsets are relative to the window
function getMapScalingCoords(scale, leftPercOffset, topPercOffset)
{
  var newScale = scale * mapFitScale;
  leftPercOffset || (leftPercOffset = 0);
  topPercOffset || (topPercOffset = 0);

  return {
    scale : newScale,
    right : (mapProjectionBounds.left * -newScale) - (leftPercOffset * winW),
    top : (topPercOffset * winH)
  };
}

//------------------------------------------------------------------------------
// layer event callbacks (context is leaflet layer object)

// function onFocusWard(e, feature)
// {
//   var style = $.extend({}, feature.__defaultStyle);
//   style.color = style.fillColor = '#F0F';
//   this.setStyle(style);
// }

// function onBlurWard(e, feature)
// {
//   this.setStyle(feature.__defaultStyle);
// }

//------------------------------------------------------------------------------
// high-level map behaviour

function activateUI()
{
  if (!mapEl.hasClass('inactive')) {
    return;
  }

  mapEl.removeClass('inactive');
  map.scrollWheelZoom.enable();
  map.doubleClickZoom.enable();
  map.touchZoom.enable();
  map.keyboard.enable();
  map.dragging.enable();

  mapEl.on('clickoutside', deactivateUI);
}

function deactivateUI()
{
  mapEl.addClass('inactive');
  map.scrollWheelZoom.disable();
  map.doubleClickZoom.disable();
  map.touchZoom.disable();
  map.keyboard.disable();
  map.dragging.disable();
}

function focusByWardName(electorate)
{
  var matched = findElectorate(electorate);

  if (matched) {
    focusGeoJSON(matched);
  }
}

function focusByMembers(memberIds)
{
  var matched = findMembersElectorate(memberIds);

  if (matched) {
    focusGeoJSON(matched);
  }
}

function focusLatLng(latlng)
{
  map.panTo(latlng, { animate: true });
}

function getGeoJSONBounds(layer)
{
  var feature = layer.feature;
  var bounds = layer.getBounds();   // this will be bounds just for the first poly

  var i = 1, coords = feature.geometry.coordinates[0], il = coords.length,
    ring, latLngs;

  // run through all following polys if this is a multipolygon shape
  if (feature.geometry.type === "MultiPolygon") {
    for (; i < il; i++) {
      ring = coords[i];
      latLngs = ring.map(function(pair) {
        return new L.LatLng(pair[1], pair[0]);
      });
      bounds.extend(new L.LatLngBounds(latLngs));
    }
  }

  return bounds;
}

// :TODO: window resize will have to be updated to deal with active bounds state to make this work
function focusGeoJSON(layer)
{
  recalculateMapTransforms(getGeoJSONBounds(layer));
}

function findElectorate(wardName)
{
  var matched;

  mapAreas.eachLayer(function(layer) {
    if (!matched && layer.feature.properties.electorate === wardName) {
      matched = layer;
    }
  });

  return matched;
}

// :IMPORTANT:  the FIRST matching member is returned, since further members unrelated to
//        the user in question may be shown to fill the list.
function findMembersElectorate(memberIds)
{
  var matched, i, l, thisId;

  if (!$.isArray(memberIds)) {
    memberIds = [memberIds];
  }

  l = memberIds.length;

  mapAreas.eachLayer(function(layer) {
    if (matched) {
      return;
    }

    thisId = layer.feature.properties.member_id;

    for (i = 0; i < l; ++i) {
      if (thisId === memberIds[i]) {
        matched = layer;
      }
    }
  });

  return matched;
}

//------------------------------------------------------------------------------

function updateMapTween(scroll, maxScroll, wSize)
{
  // console.log('scroll tween', scroll, maxScroll, wSize);
  mapScrollTween.progress(scroll / maxScroll);
}

function regenerateMapTweens()
{
  var scale_1x = getMapScalingCoords(1);
  var scale_halfx = getMapScalingCoords(0.5);
  var scale_1halfx = getMapScalingCoords(1.5);

  // ENTRY ANIMATION
  if (!mapEnterTween) {
    mapEnterTween = new TimelineMax({pause: true})
      .to(mapDOM, 0, {opacity: 0, transform: "rotateY(-90deg)"})
      .to(mapDOM, 1.25, {opacity: 1, transform: "rotateY(0) scale(" + scale_halfx.scale + ")", right: scale_halfx.right, onComplete : function() {
        ScrollHandler.bindHandler(updateMapTween);
      }});
  }

  // SCROLLING FOLLOWER
  mapScrollTween = new TimelineMax({paused: true/*, smoothChildTiming: false*/})
    .to(mapDOM, 0, {opacity: 1, transform:"scale(" + scale_halfx.scale + ")", right: scale_halfx.right})
    .to(mapDOM, 1, {opacity: 0.5, transform:"scale(" + scale_1x.scale + ")"})
    .to(mapDOM, 4, {opacity: 0.1})
    .to(mapDOM, 2, {transform:"scale(" + scale_1halfx.scale + ")", right: scale_1halfx.right})
    .to(mapDOM, 2, {opacity: 0.5, transform: "scale(" + scale_1x.scale + ")"});
}

$(window).on('resize', debounce(function(e) {
  recalculateMapTransforms(COUNTRY_BOUNDS);

  var scrollState = ScrollHandler.getCurrent();
  updateMapTween(scrollState.current, scrollState.max, scrollState.win);
}));

//------------------------------------------------------------------------------
// exports

STS.CampaignMap = {
  get : function() { return map; },

  init : initMap,
  focusPoint : focusLatLng,
  focusArea : focusGeoJSON,

  getWardForMember : findMembersElectorate,
  focusWard : focusByWardName,
  focusMembersWard : focusByMembers,

  activateUI : activateUI,
  deactivateUI : deactivateUI
};

})(jQuery, STS);

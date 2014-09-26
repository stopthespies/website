/**
 * Notes on the map positioning & animation:
 *
 * - Placing the map in the correct screen location is a pain, because map zoom is very coarse.
 *   We measure the bounds of what we want to fit, then set the map to contain that. From there
 *   we transform the map as a whole to increase its size to the exact dimensions needed.
 * - When you apply more than one GSAP tween to an element at once, it gets pretty weird about it.
 *   There must be a way to make it work, or we could just avoid their documentation and work around it.
 */

(function($, STS) {

STS.TOTAL_MAPS_COUNT = 0; // init, set after maps have loaded to DOM and used by electorate highlighting to fire across all maps

var DEFAULT_COORDS = [-28.043981, 134.912109];
var DEFAULT_ZOOM = 4;

// used to force leaflet to make the whole map visible
if (window.L) {
  var COUNTRY_BOUNDS = L.latLngBounds(L.latLng(-44.205835, 154.841309), L.latLng(-8.795678, 111.708984));
}

// all maps are the same, just add more things to this selector & adjust after creating
var mapEls = '.campaign-map';
var maps = [];
var mapShapes = [];
var MAPS_DISABLED = false;

var winW = $(window).width();
var winH = $(window).height();


//------------------------------------------------------------------------------------------------------------------------------------------------------------
// init
//------------------------------------------------------------------------------------------------------------------------------------------------------------

var MAP_INIT_CALLBACKS = {
  '.status' : function(el) {
    STS.anim.map.enter(el);
  }
};

// load up map when page is ready
$(initMaps);

// watch resize for map positioning
$(window).on('resize', debounce(function(e) {
  winW = $(window).width();
  winH = $(window).height();

  $.each(maps, function(i, map) {
    exactFitMap(map, COUNTRY_BOUNDS);
  });
}));

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// setup
//------------------------------------------------------------------------------------------------------------------------------------------------------------

function initMaps()
{
  // disabled for first launch
  if (!$(mapEls).length) {
    MAPS_DISABLED = true;
    return;
  }

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
  var wardOptions = {
    style : function(feature) {
      // :TODO: finalise pallete and hookup to legislator data
      var color = '#fff';

      var style = {
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.05,
        color: color,
        fillColor: color
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
  };

  mapEls = $(mapEls);

  mapEls.each(function() {
    mapDOM = this;
    var map = L.map(mapDOM, {}).setView(DEFAULT_COORDS, DEFAULT_ZOOM);
    var layer = L.geoJson(geojson, wardOptions).addTo(map);

    exactFitMap(map, COUNTRY_BOUNDS);

    deactivateUI(map);
    maps.push(map);
    mapShapes.push(layer);
  });

  STS.TOTAL_MAPS_COUNT = maps.length;

  // initialise the maps
  for (var filter in MAP_INIT_CALLBACKS) {
    MAP_INIT_CALLBACKS[filter](mapEls.filter(filter)[0]);
  }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// precision positioning
//------------------------------------------------------------------------------------------------------------------------------------------------------------

// :TODO: make this animated (will need to fix leaflet fitBounds() method if we end up zooming to electorates)
// :TODO: restore original position after the bounds have been projected (not yet necessary)
function getMapFitScale(map, bounds)
{
  var mapEl = $(map.getContainer());

  bounds || (bounds = COUNTRY_BOUNDS);

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

  return scaleAdjust;
}

function exactFitMap(map, bounds)
{
  $(map.getContainer()).css('transform', 'scale(' + getMapFitScale(map, bounds) + ')');
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// UI events
//------------------------------------------------------------------------------------------------------------------------------------------------------------

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

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// UI state
//------------------------------------------------------------------------------------------------------------------------------------------------------------

function activateUI(map)
{
  var mapEl = $(map.getContainer());

  if (!mapEl.hasClass('inactive')) {
    return;
  }

  mapEl.removeClass('inactive');
  map.scrollWheelZoom.enable();
  map.doubleClickZoom.enable();
  map.touchZoom.enable();
  map.keyboard.enable();
  map.dragging.enable();

  mapEl.on('clickoutside', function() {
    deactivateUI(map);
  });
}

function deactivateUI(map)
{
  var mapEl = $(map.getContainer());

  mapEl.addClass('inactive');
  map.scrollWheelZoom.disable();
  map.doubleClickZoom.disable();
  map.touchZoom.disable();
  map.keyboard.disable();
  map.dragging.disable();

  mapEl.off('clickoutside');
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// map focusing
//------------------------------------------------------------------------------------------------------------------------------------------------------------

function focusByWardName(map, electorate)
{
  var matched = findElectorate(map, electorate);

  if (matched) {
    focusGeoJSON(map, matched);
  }
}

function focusByMembers(map, memberIds)
{
  var matched = findMembersElectorate(map, memberIds);

  if (matched) {
    focusGeoJSON(map, matched);
  }
}

function focusLatLng(latlng)
{
  map.panTo(latlng, { animate: true });
}

// :TODO: window resize will have to be updated to deal with active bounds state to make this work
function focusGeoJSON(map, layer)
{
  exactFitMap(map, getGeoJSONBounds(layer));
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

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// stats map area activity intensity shading
//------------------------------------------------------------------------------------------------------------------------------------------------------------

function shadeWardsByActivity(totalEvents, reps)
{
  var i, j, k, l, rep, shape, reptotal, map;

  for (j = 0, k = reps.length; j < k && (map = maps[j]); ++j) {
    for (i = 0, l = reps.length; i < l && (rep = reps[i]); ++i) {
      reptotal = STS.getTotal(rep);
      shape = findMembersElectorate(map, rep._id);

      if (!shape) {
        continue;   // senator
      }

      var shapeData = STS.CampaignMap.getGeoJSONShape(shape);
      var g = shapeData[0];
      var $paths = shapeData[1];

      $paths.css('fill-opacity', reptotal / totalEvents);
    }
  }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// map shape search helpers
//------------------------------------------------------------------------------------------------------------------------------------------------------------

// :IMPORTANT: we assume there is one and only one layer on the map, and it's the geoJSON
function getShapeLayer(map)
{
  for (var i = 0, l = maps.length; i < l; ++i) {
    if (maps[i] === map) {
      return mapShapes[i];
    }
  }
  return null;
}

function findMapByDOM(dom, bounds)
{
  var map, i = 0, l = maps.length;

  for (; i < l; ++i) {
    if (maps[i].getContainer() === dom) {
      return maps[i];
    }
  }

  return null;
}

function findElectorate(map, wardName)
{
  var matched;

  getShapeLayer(map).eachLayer(function(layer) {
    if (!matched && layer.feature.properties.electorate === wardName) {
      matched = layer;
    }
  });

  return matched;
}

// :IMPORTANT:  the FIRST matching member is returned, since further members unrelated to
//        the user in question may be shown to fill the list.
function findMembersElectorate(map, memberIds)
{
  if (MAPS_DISABLED) {
    return null;
  }

  var matched, i, l, thisId;

  if (!$.isArray(memberIds)) {
    memberIds = [memberIds];
  }

  l = memberIds.length;

  getShapeLayer(map).eachLayer(function(layer) {
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

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// exports
//------------------------------------------------------------------------------------------------------------------------------------------------------------

STS.CampaignMap = {
  focusPoint : focusLatLng,
  focusArea : focusGeoJSON,

  getWardForMember : function(mapId, rep) {
    return findMembersElectorate(maps[mapId], rep);
  },
  focusWard : focusByWardName,
  focusMembersWard : focusByMembers,

  shadeWardStats : shadeWardsByActivity,

  redraw : exactFitMap,
  getContainerScale : function(dom, bounds) {
    var m = findMapByDOM(dom, bounds);
    return getMapFitScale(m);
  },

  // grab layer SVG elements to directly manipulate
  getGeoJSONShape : function(layer)
  {
    var i, g, $g = $(), layers;
    if (layer.getLayers && (layers = layer.getLayers())) {
      g = layers[0]._container;
      for (i = 0; i < layers.length; ++i) {
        $g = $g.add(layers[i]._container);
      }
    } else {
      g = layer._container;
      $g = $(g);
    }

    return [g, $('path', $g)];
  },

  activateUI : activateUI,
  deactivateUI : deactivateUI
};

})(jQuery, STS);

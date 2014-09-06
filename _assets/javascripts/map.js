(function($, STS) {

$(function() {
  // load up map when page is ready
  STS.CampaignMap.init();
});

var MAP_ELEMENT = '#campaign-map';
var DEFAULT_COORDS = [-28.043981, 134.912109];
var DEFAULT_ZOOM = 4;

//------------------------------------------------------------------------------
// setup

var mapEl;
var map;
var mapAreas;
var featureSelect;

function initMap(el)
{
  mapEl = $(MAP_ELEMENT);

  map = L.map(mapEl[0], {
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

  mapEl.find('.map-blocker').on('click', activateUI);
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

      feature.__defaultStyle = style; // reference here for use in callbacks

      return style;
    },
    onEachFeature: function(feature, layer) {
      layer.on("mouseover touchstart", function (e) {
        onFocusWard.call(layer, e, feature);
      });
      layer.on("mouseout touchend", function (e) {
        onBlurWard.call(layer, e, feature);
      });
      layer.on("dblclick", function(e) {
        map.setZoomAround(e.latlng);
        map.zoomIn(1);
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

function focusGeoJSON(layer)
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

  map.fitBounds(bounds, {
    pan : {
      animate: true,
      duration : 0.5
    },
    zoom : {
      animate: true,
      duration : 0.25
    }
  });
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
// exports

STS.CampaignMap = {
  get : function() { return map; },

  init : initMap,
  focusPoint : focusLatLng,
  focusArea : focusGeoJSON,

  focusWard : focusByWardName,
  focusMembersWard : focusByMembers,

  activateUI : activateUI,
  deactivateUI : deactivateUI
};

})(jQuery, STS);

/*globals L */


L.FeatureSelect = L.Class.extend({
  includes: L.Mixin.Events,

  options: {
    icon: L.divIcon({
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: 'leaflet-feature-selector'
    }),
    selectSize: [16, 16],
    featureGroup: null
  },

  initialize: function (options) {
    L.setOptions(this, options);

    this.options.selectSize = L.point(this.options.selectSize);
  },

  addTo: function (map) {
    this._map = map;
    this._center = map.getCenter();

    this.layers = {};

    this._marker = L.marker(this._center, {
      icon: this.options.icon,
      clickable: false,
      zIndexOffset: 1000
    }).addTo(map);

    map.on('move', this._checkIntersections, this);

    this.options.featureGroup.on('layeradd', function(evt) {
      this._checkIntersections();
    }, this);
    this.options.featureGroup.on('layerremove', function(evt) {
      this._handleNoIntersection(evt.layer);
      this._checkIntersections();
    }, this);

    return this;
  },

  _handleIntersection: function(layer) {
    if (!this.layers[L.stamp(layer)]) {
      this.layers[L.stamp(layer)] = layer;

      this.justSelected.push(layer);
    }
  },

  _handleNoIntersection: function(layer) {
    if (this.layers[L.stamp(layer)]) {
      delete this.layers[L.stamp(layer)];
      this.justUnselected.push(layer);
    }
  },

  _checkIntersections: function() {
    var centerPoint = this._map.project(this._center),
        selectBounds, selectBoundsCoords;

    this.justSelected = [];
    this.justUnselected  = [];

    this._center = this._map.getCenter();
    this._marker.setLatLng(this._center);

    selectBounds = L.latLngBounds(
      this._map.unproject([
        centerPoint.x + this.options.selectSize.x/2,
        centerPoint.y - this.options.selectSize.y/2
      ]),
      this._map.unproject([
        centerPoint.x - this.options.selectSize.x/2,
        centerPoint.y + this.options.selectSize.y/2
      ])
    );

    selectBoundsCoords = L.rectangle(selectBounds).toGeoJSON().geometry.coordinates[0];

    this.options.featureGroup.eachLayer(function(layer) {
      var coords = layer.feature.geometry.coordinates,
          len, i, intersects = false;

      switch (layer.feature.geometry.type) {
        case 'Point':
          coords = [ coords ];
          // fall through
        case 'MultiPoint':
          for (i=0; i<coords.length; i++) {
            if (selectBounds.contains(L.latLng([coords[i][1], coords[i][0]])))  {
              intersects = true;
            }
          }
          break;

        case 'LineString':
          coords = [ coords ];
          // fall through
        case 'MultiLineString':
          for (i=0; i<coords.length; i++) {
            if (selectBounds.intersects(layer.getBounds()) && this._lineStringsIntersect(selectBoundsCoords, coords[i])) {
              intersects = true;
            }
          }
          break;

        case 'Polygon':
          coords = [ coords ];
          // fall through
        case 'MultiPolygon':
          for (i=0; i<coords.length; i++) {
            if (selectBounds.intersects(layer.getBounds()) && this._pointInPolygon(this._center.lng, this._center.lat, coords[i][0])) {
              intersects = true;
            }
          }
          break;

      }

      if (intersects) {
        this._handleIntersection(layer);
      } else {
        this._handleNoIntersection(layer);
      }

    }, this);


    if (this.justSelected.length) {
      this.fire('select', {
        layers: this.justSelected
      });
    }

    if (this.justUnselected.length) {
      this.fire('unselect', {
        layers: this.justUnselected
      });
    }
  },

  // adapted from https://github.com/maxogden/geojson-js-utils/
  _lineStringsIntersect: function (c1, c2) {
    for (var i = 0; i <= c1.length - 2; ++i) {
      for (var j = 0; j <= c2.length - 2; ++j) {
        var a1 = {x: c1[i][1], y: c1[i][0] },
          a2 = {x: c1[i + 1][1], y: c1[i + 1][0] },
          b1 = {x: c2[j][1], y: c2[j][0] },
          b2 = {x: c2[j + 1][1], y: c2[j + 1][0] },

          ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
          ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
          u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

        if (u_b !== 0) {
          var ua = ua_t / u_b,
            ub = ub_t / u_b;
          if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
            return true;
          }
        }
      }
    }

    return false;
  },

  // Adapted from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#Listing the Vertices
  _pointInPolygon: function(x, y, polyCoords) {
    var inside = false,
        intersects, i, j;

    for (i = 0, j = polyCoords.length - 1; i < polyCoords.length; j = i++) {
      var xi = polyCoords[i][0], yi = polyCoords[i][1];
      var xj = polyCoords[j][0], yj = polyCoords[j][1];

      intersects = ((yi > y) !== (yj > y)) &&
                       (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersects) {
        inside = !inside;
      }
    }

    return inside;
  }
});

L.featureSelect = function (options) {
  return new L.FeatureSelect(options);
};

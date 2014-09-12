/**
 * Bind map appearance to window scroll offset
 *
 * :TODO: additional horizTween needs to run for desktop-width windows and move the map
 *        to the right of adjacent content blocks.
 * :TODO: create dom markers and measure offsets, then recompute tween based on their positions
 *
 * @package  StopTheSpies Website
 * @author   Sam Pospischil <pospi@spadgos.com>
 * @since    2014-09-11
 */

(function($, TM, STS) {

var $map, $panel, map, panel;

var vertTween = new TM({paused: true/*, smoothChildTiming: false*/}),
    horizTween = new TM({paused: true/*, smoothChildTiming: false*/});

function updateMapTween(scroll, maxScroll, wSize)
{
  vertTween.progress(scroll / maxScroll);

      // transform-origin doesn't like percentage values for SVG elements
  $map.css('transform-origin', wSize.width + 'px 0px');
}

//------------------------------------------------------------------------------
// initialise elements

$(function() {
  $map = $(STS.MAP_ELEMENT);
  map = $map[0];
  $panel = $('.leaflet-objects-pane', $map);
  panel = $panel[0];

  vertTween
    .to(panel, 0, {opacity: 1, transform:"scale(0.5)"})
    .to(panel, 1, {opacity: 0.5, transform:"scale(1)"})
    .to(panel, 4, {opacity: 0.1})
    .to(panel, 2, {transform: "scale(1.5) translatex(300px)"})
    .to(panel, 2, {opacity: 0.5, transform: "scale(1)"});
});

//------------------------------------------------------------------------------
// exports

STS.MapMove = {
  update: updateMapTween
};

})(jQuery, TimelineMax, STS);

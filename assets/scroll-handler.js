/**
 * Scroll event handler
 * Triggers whatever actions at whatever scroll offsets, based on DOM element visibility.
 *
 * Based on vertical scroll position only for now.
 *
 * Scroll is computed against things appearing at the bottom of the window.
 * Thus, it is best used when combined with dom elements appearing either
 * immediately before things you want to enter animating; or immediately
 * after things you want to be completely visible before starting. The same applies
 * in reverse with regard to the top of the window.
 *
 * @package  StopTheSpies Website
 * @depends  requestAnimationFrame()
 * @author   Sam Pospischil <pospi@spadgos.com>
 * @since    2014-08-26
 */


window.ScrollHandler || (window.ScrollHandler = {});

(function($, exports) {

var $window, $doc;
var wt, wb, whOffset, wwOffset, i, l, timer;
var scroll_triggers = [];
var scroll_bindings = [];
var scroll_offsets = [];
var upward_callbacks = [];

var scroll_listeners = [];

//------------------------------------------------------------------------------
// scroll position triggering. Used for firing singular events.

function addCallback(selector, callback, upwards)
{
  var el = $(selector);

  scroll_triggers.push(el);
  scroll_bindings.push(callback);
  upward_callbacks.push(upwards || false);
  scroll_offsets.push(parseInt(el.data('offset')) || 0);
}

function removeCallback(callback)
{
  for (var i = 0, l = scroll_bindings.length; i < l; ++i) {
    if (scroll_bindings[i] === callback) {
      scroll_triggers.splice(i, 1);
      scroll_bindings.splice(i, 1);
      upward_callbacks.splice(i, 1);
      scroll_offsets.splice(i, 1);
      break;
    }
  }
}

//------------------------------------------------------------------------------
// Scroll position binding. Used to receive periodical updates.
// Requires a requestAnimationFrame polyfill if oldbrowser support is required.

/**
 * Callback takes the following arguments:
 *  - current scroll value
 *  - maxiumum scroll value
 *  - window dimensions- hash of 'width' and 'height'
 */
function bindInput(callback)
{
  scroll_listeners.push(callback);

  // fire immediately to init whatever is binding
  checkScroll();
}

function removeInput(callback)
{
  for (var i = 0, l = scroll_listeners.length; i < l; ++i) {
    if (scroll_listeners[i] === callback) {
      scroll_listeners.splice(i, 1);
      break;
    }
  }
}

function onScrollUpdate(scroll, maxScroll, windowH)
{
  function doTheThing() {
    for (var i = 0, l = scroll_listeners.length; i < l; ++i) {
      scroll_listeners[i](scroll, maxScroll, windowH);
    }
    timer = null;
  }

  if (!timer) {
    timer = requestAnimationFrame(doTheThing);
  }
}

function getScrollInfo()
{
  return {
    current : wt,
    max : $doc.height() - $window.height(),
    win : {
      height: whOffset,
      width: wwOffset
    }
  };
}

//------------------------------------------------------------------------------
// initialise on DOMReady

$doc = $(document);
$window = $(window);

function checkScroll(e)
{
  var triggerPos;

  wt = $window.scrollTop(),
  wb = wt + whOffset;
  l = scroll_triggers.length;

  for (i = 0; i < l && scroll_triggers[i]; ++i) {
    triggerPos = scroll_triggers[i].offset().top - scroll_offsets[i];

    if (upward_callbacks[i] && wt < triggerPos) {
      scroll_bindings[i]();
    } else if (!upward_callbacks[i] && wb > triggerPos) {
      scroll_bindings[i]();
    }
  }

  onScrollUpdate(wt, $doc.height() - $window.height(), {
    height: whOffset,
    width: wwOffset
  });
}

function checkSize()
{
  whOffset = $window.innerHeight();
  wwOffset = $window.innerWidth();
}

$(function() {
setTimeout(function() {		// the easiest thing to do to ensure that all pending DOMReady callbacks have fired & bound Scrollhandler events
  $window.on('scroll', checkScroll);
  $window.on('resize', checkSize);
  checkSize();
  checkScroll();
}, 250);
});

//------------------------------------------------------------------------------
// EXPORTS

exports.ScrollHandler = {
  addTrigger: addCallback,
  removeTrigger: removeCallback,
  bindHandler: bindInput,
  unbindHandler: removeInput,
  getCurrent: getScrollInfo
};

})(jQuery, window);

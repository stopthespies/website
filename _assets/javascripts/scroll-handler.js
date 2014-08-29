/**
 * Scroll event handler
 * Triggers whatever actions at whatever scroll offsets, based on DOM element visibility
 *
 * Scroll is computed against things appearing at the bottom of the window.
 * Thus, it is best used when combined with dom elements appearing either
 * immediately before things you want to enter animating; or immediately
 * after things you want to be completely visible before starting.
 */

window.ScrollHandler || (window.ScrollHandler = {});

(function($) {

var $window;
var wt, whOffset, i, l;
var scroll_triggers;
var scroll_bindings;
var scroll_offsets;
var configured_callbacks = {};

function setCallbacks(callbacks)
{
  scroll_triggers = [];
  scroll_bindings = [];

  for (i in callbacks) {
    if (!callbacks.hasOwnProperty(i) || !callbacks[i]) continue;
    scroll_triggers.push($(i));
    scroll_bindings.push(callbacks[i]);
  }

  scroll_offsets = scroll_triggers.map(function(el) { return el.data('offset') || 0; });

  configured_callbacks = $.extend({}, configured_callbacks);
}

function addCallback(selector, callback)
{
  configured_callbacks[selector] = callback;

  setCallbacks(configured_callbacks);
}

function removeCallback(callback)
{
  for (var cb in configured_callbacks) {
    if (configured_callbacks[cb] === callback) {
      configured_callbacks[cb] = undefined;
      return;
    }
  }

  setCallbacks(configured_callbacks);
}

window.ScrollHandler = {
  setTriggers: setCallbacks,
  addTrigger: addCallback,
  removeTrigger: removeCallback
};

$(function() {

setTimeout(function() {		// the easiest thing to do to ensure that all pending DOMReady callbacks have fired & bound Scrollhandler events
  function checkScroll(e)
  {
    wt = $window.scrollTop() + whOffset;
    l = scroll_triggers.length;

    for (i = 0; i < l; ++i) {
      if (wt > scroll_triggers[i].offset().top - scroll_offsets[i]) {
        scroll_bindings[i]();

        scroll_triggers.splice(i, 1);
        scroll_offsets.splice(i, 1);
        scroll_bindings.splice(i, 1);
        --i;
        --l;
      }
    }
  }

  function checkSize()
  {
    whOffset = $window.innerHeight();
  }

  $window = $(window);
  $window.on('scroll', checkScroll);
  $window.on('resize', checkSize);
  checkSize();
  checkScroll();
}, 250);

});

})(jQuery);

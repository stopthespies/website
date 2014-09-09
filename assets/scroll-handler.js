/**
 * Scroll event handler
 * Triggers whatever actions at whatever scroll offsets, based on DOM element visibility
 *
 * Scroll is computed against things appearing at the bottom of the window.
 * Thus, it is best used when combined with dom elements appearing either
 * immediately before things you want to enter animating; or immediately
 * after things you want to be completely visible before starting. The same applies
 * in reverse with regard to the top of the window.
 */


window.ScrollHandler || (window.ScrollHandler = {});

(function($) {

var $window;
var wt, wb, whOffset, i, l;
var scroll_triggers = [];
var scroll_bindings = [];
var scroll_offsets = [];
var upward_callbacks = [];

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

window.ScrollHandler = {
  addTrigger: addCallback,
  removeTrigger: removeCallback
};

$(function() {

setTimeout(function() {		// the easiest thing to do to ensure that all pending DOMReady callbacks have fired & bound Scrollhandler events
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

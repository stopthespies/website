function debounce(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      func.apply(context, args);
    }, wait || 300);
  };
};

function measureH(el) { // measure things with CSS height defined as 0 & overflow hidden
  el.css({'visibility': 'hidden', 'height': 'auto'});
  var h = el.height();
  el.css({'visibility': '', 'height': ''});
  return h;
};

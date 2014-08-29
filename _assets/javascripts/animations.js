(function(TL, TM, STS) {

  function appearVSlide(container, time, completeCB)
  {
    time || (time = 0.4);

    TweenLite.set(container[0], { overflow: 'hidden', display: 'block', height: 0 });

    TweenLite.to(container[0], time, {height: measureH(container), opacity: 1, onComplete: function(e) {
      container.css({
        height: ''
      });
      if (completeCB) {
        completeCB.apply(this, arguments);
      }
    }});
  }

  function hideVSlide(container, time, completedCB)
  {
    time || (time = 0.4);

    TweenLite.set(container[0], { overflow: 'hidden', display: 'block', height: container.height() });

    TweenLite.to(container[0], time, {opacity: 0, height: 0});
  }

  // export our anims into app namespace
  STS.anim = {
    appearVSlide : appearVSlide,
    hideVSlide : hideVSlide
  };

})(TweenLite, TweenMax, STS);

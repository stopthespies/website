(function(TL, TM, STS) {

  function appearVSlide(container, time, completeCB)
  {
    time || (time = 0.4);

    TL.set(container[0], { overflow: 'hidden', display: 'block', height: 0 });

    TL.to(container[0], time, {height: measureH(container), opacity: 1, onComplete: function(e) {
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

    TL.set(container[0], { overflow: 'hidden', display: 'block', height: container.height() });

    TL.to(container[0], time, {opacity: 0, height: 0});
  }

  function scrollToEl(el, time, completedCB)
  {
    TM.to(window, time || 0.3, {
      scrollTo : { y: el.offset().top, autoKill:true },
      ease: Power1.easeOut
    });
  }

  // export our anims into app namespace
  STS.anim = {
    appearVSlide : appearVSlide,
    hideVSlide : hideVSlide,
    scrollTo : scrollToEl
  };

})(TweenLite, TweenMax, STS);

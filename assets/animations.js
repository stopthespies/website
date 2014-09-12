(function(TL, TM, TLM, STS) {

  //----------------------------------------------------------------------------
  // general use

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

  //----------------------------------------------------------------------------
  // special-case

  function mapIntro(el)
  {
    var tween,
      dom = el[0],
      innerPanel = $('.leaflet-objects-pane', el);

    if (el.data('tween')) {
      tween = el.data('tween');
    } else {
      // transform-origin doesn't like percentage values for SVG elements
      innerPanel.css('transform-origin', $(window).width() + 'px 0px');

      tween = new TLM({pause: true})
        .to(innerPanel[0], 0, {opacity: 0, transform: "rotateY(-90deg)"})
        .to(innerPanel[0], 1.25, {opacity: 1, transform: "rotateY(0) scale(0.5)", onComplete : function() {
          ScrollHandler.bindHandler(STS.MapMove.update);
        }});

      el.data('tween', tween);
    }

    tween.seek(0).play();
  }

  //----------------------------------------------------------------------------

  // export our anims into app namespace
  STS.anim = {
    appearVSlide : appearVSlide,
    hideVSlide : hideVSlide,
    scrollTo : scrollToEl,

    map : {
      intro : mapIntro
    }
  };

})(TweenLite, TweenMax, TimelineMax, STS);

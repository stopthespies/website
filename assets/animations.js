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
  // map

  function mapEnter(mapDOM)
  {
    mapEnterTween = new TimelineMax({pause: true})
      .to(mapDOM, 0, {opacity: 0, transform: "rotateY(-90deg)"})
      .to(mapDOM, 1.25, {opacity: 1, transform: "rotateY(0) scale(" + STS.CampaignMap.getContainerScale(mapDOM) + ")"});

    return mapEnterTween;
  }

  //----------------------------------------------------------------------------
  // map electorates

  var runningMapTweens = [];

  function pingElectorate(layer, color, intensity, completedCB)
  {
    intensity = Math.max(intensity, 10) / 10;  // clamp size of pulses

    // bring to front
    layer.bringToFront();

    // grab SVG elements to animate
    var i, g, $g = $(), layers;
    if (layer.getLayers && (layers = layer.getLayers())) {
      g = layers[0]._container;
      for (i = 0; i < layers.length; ++i) {
        $g = $g.add(layers[i]._container);
      }
    } else {
      g = layer._container;
      $g = $(g);
    }

    var $paths = $('path', $g);
    var currentAttrs;

    // abort any running animations on this electorate and read stateless attributes to finish on
    for (var i = 0, l = runningMapTweens.length, running; i < l && (running = runningMapTweens[i]); ++i) {
      if (running[0] === g) {
        running[1].kill();
        currentAttrs = running[2];
        runningMapTweens.splice(i, 1);
        break;
      }
    }

    // read current attributes if we're not doing anything yet
    if (!currentAttrs) {
      currentAttrs = [
        'stroke-width', 'stroke', 'fill', 'fill-opacity',
      ].reduce(function(attrs, at) {
        attrs[at] = $paths.attr(at);
        return attrs;
      }, {});
    }

    var newTimeline = new TLM({ onComplete: completedCB || function() {} });

    newTimeline.to($paths, 0.1, {
      'stroke-width': '5px',
      'stroke': color,
      'fill': color,
      'fill-opacity': 0.2 + (0.8 * intensity),
      ease: Power1.easeOut
    }).to($paths, 0.5, currentAttrs);

    runningMapTweens.push([g, newTimeline, currentAttrs]);
  }

  //----------------------------------------------------------------------------

  // export our anims into app namespace
  STS.anim = {
    appearVSlide : appearVSlide,
    hideVSlide : hideVSlide,
    scrollTo : scrollToEl,

    map : {
      enter : mapEnter,
      notifyElectorate: pingElectorate
    }
  };

})(TweenLite, TweenMax, TimelineMax, STS);

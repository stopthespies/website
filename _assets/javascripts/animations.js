(function(TL, TM, TLM, STS) {

var MAP_OPACITY = 0.3;
var AREA_FLASH_RADIUS = '8px';

  //----------------------------------------------------------------------------
  // general use

  function appearVSlide(container, time, completeCB)
  {
    time || (time = 0.4);

    TL.set(container[0], { overflow: 'hidden', display: 'block', height: 0 });

    TL.to(container[0], time, {height: measureH(container), opacity: 1, onComplete: function(e) {
      container.css({
        height: 'auto'
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

    TL.to(container[0], time, {opacity: 0, height: 0, onComplete: function(e) {
      container.css({
        display: 'none',
        height: 0
      });
    }});
  }

  function scrollToEl(el, time, completedCB)
  {
    TM.to(window, time || 0.3, {
      scrollTo : { y: el.offset().top, autoKill:true },
      ease: Power1.easeOut,
      onComplete : completedCB
    });
  }

  //----------------------------------------------------------------------------
  // map

  function mapEnter(mapDOM)
  {
    var img = $(mapDOM).find('img');

    var mapEnterTween = new TimelineMax({pause: true}).to(mapDOM, 0, {opacity: 0, transform: "rotateY(0) scale(" + STS.CampaignMap.getContainerScale(mapDOM) + ")"});

    if (img.length) {
      mapEnterTween.to(img[0], 0.5, {opacity: 0});
    }

    mapEnterTween.to(mapDOM, 1.25, {opacity: MAP_OPACITY});

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

    var shapeData = STS.CampaignMap.getGeoJSONShape(layer);
    var g = shapeData[0];
    var $paths = shapeData[1];

    // :NOTE: leaflet does something internally and moves things into a CSS subproperty
    var baseAttrs = layer.feature.__defaultStyle.css ? layer.feature.__defaultStyle.css : layer.feature.__defaultStyle;

    // abort any running animations on this electorate and read stateless attributes to finish on
    for (var i = 0, l = runningMapTweens.length, running; i < l && (running = runningMapTweens[i]); ++i) {
      if (running[0] === g) {
        running[1].kill();
        runningMapTweens.splice(i, 1);
        break;
      }
    }

    var newTimeline = new TLM({ onComplete: completedCB || function() {} });

    newTimeline.to($paths, 0.5, {
      'strokeWidth': AREA_FLASH_RADIUS,
      'stroke': color,
      'fill': color,
      'fillOpacity': 0.4 + (0.6 * intensity),
      'strokeOpacity': 0.4 + (0.6 * intensity),
      ease: Power1.easeOut
    }).to($paths, 0.9, {
      'strokeWidth': baseAttrs.weight,
      'stroke': baseAttrs.color,
      'fill': baseAttrs.fillColor,
      'fillOpacity': baseAttrs.fillOpacity,
      'strokeOpacity': baseAttrs.opacity
    });

    runningMapTweens.push([g, newTimeline]);
  }

  //----------------------------------------------------------------------------

  // export our anims into app namespace
  STS.anim = {
    appearVSlide : appearVSlide,
    hideVSlide : hideVSlide,
    scrollToEl : scrollToEl,

    map : {
      enter : mapEnter,
      notifyElectorate: pingElectorate
    }
  };

})(TweenLite, TweenMax, TimelineMax, STS);

(() => {
  const root = document.documentElement;
  const openingScene = document.querySelector("#opening-sky");
  const continuationScene = document.querySelector("#river-continuation");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const OPENING = {
    heroOut: [.2, .35],
    verseIn: [.5, .58],
    verseOut: [.8, .87],
    bridgeIn: [.84, .89],
    bridgeOut: [.915, .985],
    // The river sentence should already be clearly visible before the
    // landscape begins travelling down toward the river.
    riverRevealAfterBridgeVisibility: .7,
    referenceBlendAmount: .18,
    riverRevealAmount: .6,
    riverStartFocus: 18,
    riverEndFocus: 58,
  };

  let frameRequested = false;

  function clamp(value) {
    return Math.min(1, Math.max(0, value));
  }

  function easeBetween(progress, start, end) {
    const value = clamp((progress - start) / (end - start));
    return value * value * (3 - 2 * value);
  }

  function updateOpeningScene() {
    if (!openingScene) return;

    const totalTravel = Math.max(1, openingScene.offsetHeight - window.innerHeight);
    const scrolled = Math.min(
      totalTravel,
      Math.max(0, window.scrollY - openingScene.offsetTop)
    );

    const openingPhaseRatio = window.innerWidth <= 760 ? 3.6 / 5.6 : 3.8 / 6;
    const openingTravel = Math.max(1, totalTravel * openingPhaseRatio);
    const remainingRiverTravel = Math.max(1, totalTravel - openingTravel);

    const openingProgress = clamp(scrolled / openingTravel);
    const postOpeningRiverProgress = clamp((scrolled - openingTravel) / remainingRiverTravel);

    const heroDeparture = easeBetween(openingProgress, ...OPENING.heroOut);
    const verseArrival = easeBetween(openingProgress, ...OPENING.verseIn);
    const verseDeparture = easeBetween(openingProgress, ...OPENING.verseOut);
    const bridgeArrival = easeBetween(openingProgress, ...OPENING.bridgeIn);
    const bridgeDeparture = easeBetween(openingProgress, ...OPENING.bridgeOut);

    // Keep the two visual jobs separate:
    // 1) the first scripture/reference beat introduces only a shallow slice
    //    of the pale top of the river artwork;
    // 2) once “beneath it rivers flow” is clearly visible, one shared reveal
    //    progress controls BOTH the crop movement and the window expansion.
    // This prevents one property from revealing the river ahead of another.
    const referenceBlend = verseArrival;
    const riverReveal = easeBetween(
      bridgeArrival,
      OPENING.riverRevealAfterBridgeVisibility,
      1
    );

    const landscapeReveal = Math.min(
      OPENING.referenceBlendAmount + OPENING.riverRevealAmount,
      OPENING.referenceBlendAmount * referenceBlend + OPENING.riverRevealAmount * riverReveal
    );

    const closeCloudDeparture = easeBetween(postOpeningRiverProgress, 0, .42);
    const distantCloudDeparture = easeBetween(postOpeningRiverProgress, .03, .52);

    // Before the river sentence is visibly underway, landscapeReveal can only
    // reach the shallow reference-blend amount. The larger reveal is driven by
    // riverReveal, the same value that moves the crop downward.
    const landscapeHeight = 82 * landscapeReveal + 18 * postOpeningRiverProgress;
    const landscapeY = 2 * (1 - landscapeReveal) - 6 * postOpeningRiverProgress;
    const landscapeScale = .96 + .04 * landscapeReveal + .22 * postOpeningRiverProgress;
    const landscapeMaskFactor = 1 - postOpeningRiverProgress;
    const landscapeFocusY =
      OPENING.riverStartFocus +
      (OPENING.riverEndFocus - OPENING.riverStartFocus) * riverReveal;

    if (!reduceMotion.matches) {
      root.style.setProperty("--sky-progress", openingProgress.toFixed(4));
      root.style.setProperty(
        "--scroll-cue-opacity",
        Math.max(0, 1 - openingProgress * 8).toFixed(3)
      );
      root.style.setProperty("--landscape-focus-y", `${landscapeFocusY.toFixed(3)}%`);
      root.style.setProperty(
        "--close-cloud-y",
        `${(-10 * openingProgress - 132 * closeCloudDeparture).toFixed(3)}vh`
      );
      root.style.setProperty(
        "--distant-cloud-y",
        `${(-3.5 * openingProgress - 104 * distantCloudDeparture).toFixed(3)}vh`
      );
    } else {
      root.style.setProperty("--scroll-cue-opacity", "0");
    }

    root.style.setProperty("--hero-opacity", (1 - heroDeparture).toFixed(3));
    root.style.setProperty("--hero-y", `${(-5 * heroDeparture).toFixed(3)}vh`);
    root.style.setProperty(
      "--verse-opacity",
      (verseArrival * (1 - verseDeparture)).toFixed(3)
    );
    root.style.setProperty(
      "--verse-y",
      `${(2 - 5 * easeBetween(openingProgress, .5, .8) - 6 * verseDeparture).toFixed(3)}vh`
    );
    root.style.setProperty(
      "--bridge-opacity",
      (bridgeArrival * (1 - bridgeDeparture)).toFixed(3)
    );
    root.style.setProperty("--bridge-y", `${(2 * (1 - bridgeArrival)).toFixed(3)}vh`);

    root.style.setProperty("--landscape-reveal", landscapeReveal.toFixed(4));
    root.style.setProperty("--landscape-height", `${landscapeHeight.toFixed(3)}%`);
    root.style.setProperty("--landscape-y", `${landscapeY.toFixed(3)}vh`);
    root.style.setProperty("--landscape-scale", landscapeScale.toFixed(4));
    root.style.setProperty(
      "--landscape-mask-mid",
      `${(9 * landscapeMaskFactor).toFixed(3)}%`
    );
    root.style.setProperty(
      "--landscape-mask-end",
      `${(20 * landscapeMaskFactor).toFixed(3)}%`
    );

    // The garden belongs only to the later fruit-and-shade beat.
    root.style.setProperty("--garden-reveal", "0");
  }

  function updateContinuationScene() {
    if (!continuationScene) return;

    const continuationRect = continuationScene.getBoundingClientRect();
    const continuationTravel = Math.max(
      1,
      continuationScene.offsetHeight - window.innerHeight
    );
    const progress = clamp(-continuationRect.top / continuationTravel);

    const descentProgress = easeBetween(progress, 0, .3);
    const aerialDeparture = easeBetween(progress, .3, .47);
    const worldArrival = easeBetween(progress, .27, .45);
    const mistArrival = easeBetween(progress, .17, .3);
    const mistDeparture = easeBetween(progress, .36, .52);
    const forwardProgress = easeBetween(progress, .44, 1);
    const fruitArrival = easeBetween(progress, .5, .58);
    const fruitDeparture = easeBetween(progress, .69, .76);
    const outcomeArrival = easeBetween(progress, .76, .84);

    let gardenReveal = 0;
    const fruitAndShadeBeat = document.querySelector(".fruit-and-shade");
    if (fruitAndShadeBeat) {
      const beatRect = fruitAndShadeBeat.getBoundingClientRect();
      const beatCenter = beatRect.top + beatRect.height / 2;
      const beatPosition = 1 - beatCenter / Math.max(window.innerHeight, 1);
      gardenReveal = easeBetween(beatPosition, .18, .5);
    }

    root.style.setProperty(
      "--continuation-viewport-opacity",
      continuationRect.top <= .5 ? "1" : "0"
    );
    root.style.setProperty(
      "--continuation-aerial-opacity",
      (1 - aerialDeparture).toFixed(3)
    );
    root.style.setProperty("--lower-river-opacity", worldArrival.toFixed(3));
    root.style.setProperty(
      "--descent-mist-opacity",
      (.94 * mistArrival * (1 - mistDeparture)).toFixed(3)
    );
    root.style.setProperty(
      "--fruit-opacity",
      (fruitArrival * (1 - fruitDeparture)).toFixed(3)
    );
    root.style.setProperty(
      "--fruit-y",
      `${(2 - 4 * fruitArrival - 4 * fruitDeparture).toFixed(3)}vh`
    );
    root.style.setProperty("--outcome-opacity", outcomeArrival.toFixed(3));
    root.style.setProperty(
      "--outcome-y",
      `${(2 * (1 - outcomeArrival)).toFixed(3)}vh`
    );
    root.style.setProperty("--garden-reveal", gardenReveal.toFixed(4));

    if (!reduceMotion.matches) {
      root.style.setProperty(
        "--continuation-aerial-scale",
        (1.22 + .14 * descentProgress).toFixed(4)
      );
      root.style.setProperty(
        "--continuation-aerial-y",
        `${(-6 - 4 * descentProgress).toFixed(3)}vh`
      );
      root.style.setProperty(
        "--continuation-aerial-focus-y",
        `${(58 + 6 * descentProgress).toFixed(3)}%`
      );
      root.style.setProperty("--river-far-scale", (1 + .025 * forwardProgress).toFixed(4));
      root.style.setProperty("--river-far-y", `${(-1 * forwardProgress).toFixed(3)}vh`);
      root.style.setProperty("--river-water-scale", (1 + .08 * forwardProgress).toFixed(4));
      root.style.setProperty("--river-water-y", `${(-2.5 * forwardProgress).toFixed(3)}vh`);
      root.style.setProperty("--river-banks-scale", (1 + .14 * forwardProgress).toFixed(4));
      root.style.setProperty("--river-banks-y", `${(-4.5 * forwardProgress).toFixed(3)}vh`);
      root.style.setProperty("--river-foliage-scale", (1 + .3 * forwardProgress).toFixed(4));
      root.style.setProperty("--river-foliage-y", `${(-10 * forwardProgress).toFixed(3)}vh`);
    }
  }

  function updateScenes() {
    frameRequested = false;
    updateOpeningScene();
    updateContinuationScene();
  }

  function requestUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(updateScenes);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  reduceMotion.addEventListener?.("change", requestUpdate);
  requestUpdate();
})();
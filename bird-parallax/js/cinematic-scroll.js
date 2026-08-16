(() => {
  const root = document.documentElement;
  const scene = document.querySelector("#opening-sky");
  const continuation = document.querySelector("#river-continuation");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frameRequested = false;

  function clamp(value) {
    return Math.min(1, Math.max(0, value));
  }

  function easeBetween(progress, start, end) {
    const value = clamp((progress - start) / (end - start));
    return value * value * (3 - 2 * value);
  }

  function updateScenes() {
    frameRequested = false;

    if (!scene) return;

    const totalTravel = Math.max(1, scene.offsetHeight - window.innerHeight);
    // The viewport inside the opening is sticky, so its bounding rect stays
    // pinned at the top. Use document scroll position for the scene progress.
    const scrolled = Math.min(
      totalTravel,
      Math.max(0, window.scrollY - scene.offsetTop)
    );
    // Preserve the original opening/river phase proportions inside the
    // shorter text-layout scroll distance, so content position does not move.
    const openingPhaseRatio = window.innerWidth <= 760 ? 3.6 / 5.6 : 3.8 / 6;
    const previousOpeningTravel = Math.max(1, totalTravel * openingPhaseRatio);
    const riverTravel = Math.max(1, totalTravel - previousOpeningTravel);
    const progress = clamp(scrolled / previousOpeningTravel);
    let riverProgress = clamp((scrolled - previousOpeningTravel) / riverTravel);
    const heroDeparture = easeBetween(progress, .2, .35);
    const verseArrival = easeBetween(progress, .5, .58);
    const verseDeparture = easeBetween(progress, .8, .87);
    const bridgeArrival = easeBetween(progress, .84, .89);
    const bridgeDeparture = easeBetween(progress, .915, .985);
    let landscapeReveal = easeBetween(progress, .855, 1);
    const gardenReveal = easeBetween(progress, .72, .92);

    // Synchronize the landscape with the actual “beneath it rivers flow”
    // content beat. This remains responsive if the text layout changes.
    const riversBeat = document.querySelector(
      '#content-scene-the-promise .source-beat[data-beat="2"]'
    );
    if (riversBeat) {
      const beatRect = riversBeat.getBoundingClientRect();
      const beatCenter = beatRect.top + beatRect.height / 2;
      const beatPosition = 1 - beatCenter / Math.max(window.innerHeight, 1);
      landscapeReveal = easeBetween(beatPosition, .18, .48);
      riverProgress = easeBetween(beatPosition, .32, .82);
    }

    if (!reduceMotion.matches) {
      root.style.setProperty("--sky-progress", progress.toFixed(4));
      root.style.setProperty("--scroll-cue-opacity", Math.max(0, 1 - progress * 8).toFixed(3));
    } else {
      root.style.setProperty("--scroll-cue-opacity", "0");
    }

    root.style.setProperty("--hero-opacity", (1 - heroDeparture).toFixed(3));
    root.style.setProperty("--hero-y", `${(-5 * heroDeparture).toFixed(3)}vh`);
    root.style.setProperty("--verse-opacity", (verseArrival * (1 - verseDeparture)).toFixed(3));
    root.style.setProperty("--verse-y", `${(2 - 5 * easeBetween(progress, .5, .8) - 6 * verseDeparture).toFixed(3)}vh`);
    root.style.setProperty("--bridge-opacity", (bridgeArrival * (1 - bridgeDeparture)).toFixed(3));
    root.style.setProperty("--bridge-y", `${(2 * (1 - bridgeArrival)).toFixed(3)}vh`);
    root.style.setProperty("--landscape-reveal", landscapeReveal.toFixed(4));
    root.style.setProperty("--garden-reveal", gardenReveal.toFixed(4));

    const closeCloudDeparture = easeBetween(riverProgress, 0, .42);
    const distantCloudDeparture = easeBetween(riverProgress, .03, .52);
    const landscapeHeight = 82 * landscapeReveal + 18 * riverProgress;
    const landscapeY = 2 * (1 - landscapeReveal) - 6 * riverProgress;
    const landscapeScale = .96 + .04 * landscapeReveal + .22 * riverProgress;
    const landscapeMaskFactor = 1 - riverProgress;

    root.style.setProperty("--landscape-height", `${landscapeHeight.toFixed(3)}%`);
    root.style.setProperty("--landscape-y", `${landscapeY.toFixed(3)}vh`);
    root.style.setProperty("--landscape-scale", landscapeScale.toFixed(4));
    root.style.setProperty("--landscape-mask-mid", `${(9 * landscapeMaskFactor).toFixed(3)}%`);
    root.style.setProperty("--landscape-mask-end", `${(20 * landscapeMaskFactor).toFixed(3)}%`);

    if (!reduceMotion.matches) {
      // As the aerial image rises into view, shift its focal point down into
      // the river rather than leaving the wide viewport on the pale sky at
      // the top of the portrait asset.
      root.style.setProperty(
        "--landscape-focus-y",
        `${(48 + 10 * landscapeReveal).toFixed(3)}%`
      );
      root.style.setProperty("--close-cloud-y", `${(-10 * progress - 132 * closeCloudDeparture).toFixed(3)}vh`);
      root.style.setProperty("--distant-cloud-y", `${(-3.5 * progress - 104 * distantCloudDeparture).toFixed(3)}vh`);
    }

    if (!continuation) return;

    const continuationRect = continuation.getBoundingClientRect();
    const continuationTravel = Math.max(1, continuation.offsetHeight - window.innerHeight);
    const continuationProgress = clamp(-continuationRect.top / continuationTravel);
    const descentProgress = easeBetween(continuationProgress, 0, .3);
    const aerialDeparture = easeBetween(continuationProgress, .3, .47);
    const worldArrival = easeBetween(continuationProgress, .27, .45);
    const mistArrival = easeBetween(continuationProgress, .17, .3);
    const mistDeparture = easeBetween(continuationProgress, .36, .52);
    const forwardProgress = easeBetween(continuationProgress, .44, 1);
    const fruitArrival = easeBetween(continuationProgress, .5, .58);
    const fruitDeparture = easeBetween(continuationProgress, .69, .76);
    const outcomeArrival = easeBetween(continuationProgress, .76, .84);

    root.style.setProperty("--continuation-viewport-opacity", continuationRect.top <= .5 ? "1" : "0");
    root.style.setProperty("--continuation-aerial-opacity", (1 - aerialDeparture).toFixed(3));
    root.style.setProperty("--lower-river-opacity", worldArrival.toFixed(3));
    root.style.setProperty("--descent-mist-opacity", (.94 * mistArrival * (1 - mistDeparture)).toFixed(3));
    root.style.setProperty("--fruit-opacity", (fruitArrival * (1 - fruitDeparture)).toFixed(3));
    root.style.setProperty("--fruit-y", `${(2 - 4 * fruitArrival - 4 * fruitDeparture).toFixed(3)}vh`);
    root.style.setProperty("--outcome-opacity", outcomeArrival.toFixed(3));
    root.style.setProperty("--outcome-y", `${(2 * (1 - outcomeArrival)).toFixed(3)}vh`);

    if (!reduceMotion.matches) {
      root.style.setProperty("--continuation-aerial-scale", (1.22 + .14 * descentProgress).toFixed(4));
      root.style.setProperty("--continuation-aerial-y", `${(-6 - 4 * descentProgress).toFixed(3)}vh`);
      root.style.setProperty("--continuation-aerial-focus-y", `${(58 + 6 * descentProgress).toFixed(3)}%`);
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

  function requestUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(updateScenes);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  reduceMotion.addEventListener?.("change", requestUpdate);
  const contentRoot = document.querySelector("#part-one-scenes");
  if (contentRoot) {
    new MutationObserver(requestUpdate).observe(contentRoot, { childList: true });
  }
  requestUpdate();
})();

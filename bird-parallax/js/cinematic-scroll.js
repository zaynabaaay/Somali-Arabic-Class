(() => {
  const root = document.documentElement;
  const scene = document.querySelector("#opening-sky");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frameRequested = false;

  function clamp(value) {
    return Math.min(1, Math.max(0, value));
  }

  function easeBetween(progress, start, end) {
    const value = clamp((progress - start) / (end - start));
    return value * value * (3 - 2 * value);
  }

  function elementArrival(element, startViewport, endViewport) {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const viewportPosition = 1 - center / Math.max(window.innerHeight, 1);
    return easeBetween(viewportPosition, 1 - startViewport, 1 - endViewport);
  }

  function scrollBetween(startElement, endElement, startViewport, endViewport) {
    if (!startElement || !endElement) return 0;
    const viewportHeight = Math.max(window.innerHeight, 1);
    const startRect = startElement.getBoundingClientRect();
    const endRect = endElement.getBoundingClientRect();
    const startScroll = window.scrollY + startRect.top + startRect.height / 2
      - viewportHeight * startViewport;
    const endScroll = window.scrollY + endRect.top + endRect.height / 2
      - viewportHeight * endViewport;
    return clamp((window.scrollY - startScroll) / Math.max(1, endScroll - startScroll));
  }

  function updateScenes() {
    frameRequested = false;
    if (!scene) return;

    const scrolled = Math.max(0, window.scrollY - scene.offsetTop);
    const openingTravel = Math.max(
      1,
      window.innerHeight * (window.innerWidth <= 760 ? 2.3143 : 2.4067)
    );
    const progress = clamp(scrolled / openingTravel);

    const heroDeparture = easeBetween(progress, .2, .35);
    const verseArrival = easeBetween(progress, .5, .58);
    const verseDeparture = easeBetween(progress, .8, .87);
    const bridgeArrival = easeBetween(progress, .84, .89);
    const bridgeDeparture = easeBetween(progress, .915, .985);

    const promiseScene = document.querySelector("#content-scene-the-promise");
    const firstVerse = promiseScene?.querySelector('.source-beat[data-beat="1"]');
    const riverLine = promiseScene?.querySelector('.source-beat[data-beat="2"]');
    const fruitLine = promiseScene?.querySelector('.source-beat[data-beat="3"]');
    const landscapeReveal = elementArrival(firstVerse, .95, .5);
    const preLineDrift = scrollBetween(firstVerse, riverLine, .95, .95);
    const atmosphereProgress = scrollBetween(firstVerse, riverLine, .95, .12);
    const landscapeJourney = elementArrival(riverLine, .95, .12);
    const gardenReveal = elementArrival(fruitLine, .95, .5);
    const gardenProgress = elementArrival(fruitLine, .95, .12);

    const firstToEnterScene = document.querySelector("#content-scene-the-first-to-enter");
    const fullMoonLine = firstToEnterScene?.querySelector('.source-beat[data-beat="1"]');
    const nextFirstToEnterLine = firstToEnterScene?.querySelector('.source-beat[data-beat="2"]');
    const moonArrival = elementArrival(fullMoonLine, .95, .5);
    const moonProgress = elementArrival(fullMoonLine, .95, .12);
    const moonDeparture = elementArrival(nextFirstToEnterLine, .95, .5);
    const moonReveal = moonArrival * (1 - moonDeparture);

    if (!reduceMotion.matches) {
      root.style.setProperty("--sky-progress", progress.toFixed(4));
      root.style.setProperty(
        "--scroll-cue-opacity",
        Math.max(0, 1 - progress * 8).toFixed(3)
      );
      root.style.setProperty(
        "--landscape-focus-y",
        `${(3 * preLineDrift + 65 * landscapeJourney).toFixed(3)}%`
      );
      root.style.setProperty(
        "--landscape-scroll-y",
        `${(-12 * preLineDrift - 33 * landscapeJourney).toFixed(3)}vh`
      );
      root.style.setProperty(
        "--landscape-scale",
        (1.6 - .2 * preLineDrift - .4 * landscapeJourney).toFixed(4)
      );
      root.style.setProperty("--garden-y", `${(4 - 8 * gardenProgress).toFixed(3)}vh`);
      root.style.setProperty("--garden-scale", (1.06 - .04 * gardenProgress).toFixed(4));
      root.style.setProperty("--moon-y", `${(4 - 8 * moonProgress).toFixed(3)}vh`);
      root.style.setProperty("--moon-scale", (1.06 - .04 * moonProgress).toFixed(4));
    } else {
      root.style.setProperty("--scroll-cue-opacity", "0");
      const riverIsIntroduced = landscapeJourney > 0 ? 1 : 0;
      root.style.setProperty("--landscape-focus-y", riverIsIntroduced ? "68%" : "0%");
      root.style.setProperty("--landscape-scroll-y", riverIsIntroduced ? "-45vh" : "0vh");
      root.style.setProperty("--landscape-scale", riverIsIntroduced ? "1" : "1.6");
      root.style.setProperty("--garden-y", "0vh");
      root.style.setProperty("--garden-scale", "1.02");
      root.style.setProperty("--moon-y", "0vh");
      root.style.setProperty("--moon-scale", "1.02");
    }

    root.style.setProperty("--hero-opacity", (1 - heroDeparture).toFixed(3));
    root.style.setProperty("--hero-y", `${(-5 * heroDeparture).toFixed(3)}vh`);
    root.style.setProperty(
      "--verse-opacity",
      (verseArrival * (1 - verseDeparture)).toFixed(3)
    );
    root.style.setProperty(
      "--verse-y",
      `${(2 - 5 * easeBetween(progress, .5, .8) - 6 * verseDeparture).toFixed(3)}vh`
    );
    root.style.setProperty(
      "--bridge-opacity",
      (bridgeArrival * (1 - bridgeDeparture)).toFixed(3)
    );
    root.style.setProperty("--bridge-y", `${(2 * (1 - bridgeArrival)).toFixed(3)}vh`);
    root.style.setProperty("--landscape-reveal", landscapeReveal.toFixed(4));
    root.style.setProperty("--garden-reveal", gardenReveal.toFixed(4));
    root.style.setProperty("--moon-reveal", moonReveal.toFixed(4));

    const closeCloudDeparture = easeBetween(atmosphereProgress, 0, .72);
    const distantCloudDeparture = easeBetween(atmosphereProgress, .08, .88);

    if (!reduceMotion.matches) {
      root.style.setProperty(
        "--close-cloud-y",
        `${(-10 * progress - 132 * closeCloudDeparture).toFixed(3)}vh`
      );
      root.style.setProperty(
        "--distant-cloud-y",
        `${(-3.5 * progress - 104 * distantCloudDeparture).toFixed(3)}vh`
      );
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

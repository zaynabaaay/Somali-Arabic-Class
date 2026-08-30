(() => {
  const root = document.documentElement;
  const scene = document.querySelector("#opening-sky");
  const partOne = document.querySelector("#part-one-content");
  const partTwo = document.querySelector("#part-two-content");
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

  function syncPinnedTimeline(endScene) {
    if (!scene || !partOne || !endScene) return;

    const viewportHeight = Math.max(window.innerHeight, 1);
    let overlap = viewportHeight;

    if (partOne.contains(endScene)) {
      overlap = Math.max(
        viewportHeight,
        endScene.offsetTop + endScene.offsetHeight
      );
    } else if (partTwo?.contains(endScene)) {
      overlap = Math.max(
        viewportHeight,
        partOne.offsetHeight + endScene.offsetTop + endScene.offsetHeight
      );
    }

    scene.style.height = `${viewportHeight + overlap}px`;
    partOne.style.marginTop = `-${overlap}px`;
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
    const seeingAllahScene = document.querySelector("#content-scene-seeing-allah");
    const alBaqarahScene = document.querySelector("#part-two-al-baqarah-2-214");
    const muslim2822Scene = document.querySelector("#part-two-muslim-2822");

    syncPinnedTimeline(
      muslim2822Scene ||
      alBaqarahScene ||
      seeingAllahScene ||
      firstToEnterScene
    );

    const fullMoonLine = firstToEnterScene?.querySelector('.source-beat[data-beat="1"]');
    const seeingAllahCitation = seeingAllahScene?.querySelector('.source-citation');
    const seeingAllahBeats = seeingAllahScene?.querySelectorAll('.source-beat');
    const seeingAllahLastBeat = seeingAllahBeats?.[seeingAllahBeats.length - 1];

    const moonArrival = elementArrival(fullMoonLine, .7, .42);
    const moonProgress = elementArrival(fullMoonLine, .7, .12);

    const skyReturn = elementArrival(seeingAllahCitation, .95, .5);
    const moonReveal = moonArrival * (1 - skyReturn);
    const restoredLandscapeReveal = landscapeReveal * (1 - skyReturn);
    const restoredGardenReveal = gardenReveal * (1 - skyReturn);

    const seeingAllahProgress = scrollBetween(
      seeingAllahCitation,
      seeingAllahLastBeat,
      .5,
      .12
    );
    const seeingCloseCloudDeparture = easeBetween(seeingAllahProgress, 0, .72);
    const seeingDistantCloudDeparture = easeBetween(seeingAllahProgress, .08, .88);

    const restoredSkyProgress =
      progress * (1 - skyReturn) + seeingAllahProgress * skyReturn;

    const povertyLine = alBaqarahScene?.querySelector('.source-beat[data-beat="2"]');
    const nextLine = alBaqarahScene?.querySelector('.source-beat[data-beat="3"]');
    const nextExitAnchor = muslim2822Scene?.querySelector('.source-citation');

    const povertyArrival = elementArrival(povertyLine, .7, .42);
    const povertyProgress = elementArrival(povertyLine, .7, .12);
    const nextArrival = elementArrival(nextLine, .7, .42);
    const nextProgress = elementArrival(nextLine, .7, .12);
    const nextFade = elementArrival(nextExitAnchor, .95, .5);

    const povertyReveal = povertyArrival * (1 - nextArrival);
    const nextReveal = nextArrival * (1 - nextFade);

    if (!reduceMotion.matches) {
      root.style.setProperty("--sky-progress", restoredSkyProgress.toFixed(4));
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
      root.style.setProperty("--poverty-y", `${(4 - 8 * povertyProgress).toFixed(3)}vh`);
      root.style.setProperty("--poverty-scale", (1.06 - .04 * povertyProgress).toFixed(4));
      root.style.setProperty("--next-visual-y", `${(4 - 8 * nextProgress).toFixed(3)}vh`);
      root.style.setProperty("--next-visual-scale", (1.06 - .04 * nextProgress).toFixed(4));
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
      root.style.setProperty("--poverty-y", "0vh");
      root.style.setProperty("--poverty-scale", "1.02");
      root.style.setProperty("--next-visual-y", "0vh");
      root.style.setProperty("--next-visual-scale", "1.02");
      root.style.setProperty(
        "--sky-progress",
        (skyReturn > .5 ? seeingAllahProgress : progress).toFixed(4)
      );
    }

    root.style.setProperty("--hero-opacity", (1 - heroDeparture).toFixed(3));
    root.style.setProperty("--hero-y", `${(-5 * heroDeparture).toFixed(3)}vh`);
    root.style.setProperty("--landscape-reveal", restoredLandscapeReveal.toFixed(4));
    root.style.setProperty("--garden-reveal", restoredGardenReveal.toFixed(4));
    root.style.setProperty("--moon-reveal", moonReveal.toFixed(4));
    root.style.setProperty("--poverty-reveal", povertyReveal.toFixed(4));
    root.style.setProperty("--next-visual-reveal", nextReveal.toFixed(4));

    const closeCloudDeparture = easeBetween(atmosphereProgress, 0, .72);
    const distantCloudDeparture = easeBetween(atmosphereProgress, .08, .88);

    if (!reduceMotion.matches) {
      const departedCloseCloudY = -10 * progress - 132 * closeCloudDeparture;
      const departedDistantCloudY = -3.5 * progress - 104 * distantCloudDeparture;
      const seeingCloseCloudY =
        -10 * seeingAllahProgress - 132 * seeingCloseCloudDeparture;
      const seeingDistantCloudY =
        -3.5 * seeingAllahProgress - 104 * seeingDistantCloudDeparture;

      root.style.setProperty(
        "--close-cloud-y",
        `${(
          departedCloseCloudY * (1 - skyReturn) +
          seeingCloseCloudY * skyReturn
        ).toFixed(3)}vh`
      );
      root.style.setProperty(
        "--distant-cloud-y",
        `${(
          departedDistantCloudY * (1 - skyReturn) +
          seeingDistantCloudY * skyReturn
        ).toFixed(3)}vh`
      );
    } else if (skyReturn > .5) {
      root.style.setProperty("--close-cloud-y", "0vh");
      root.style.setProperty("--distant-cloud-y", "0vh");
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

  ["#part-one-scenes", "#part-two-scenes"].forEach((selector) => {
    const contentRoot = document.querySelector(selector);
    if (contentRoot) {
      new MutationObserver(requestUpdate).observe(contentRoot, { childList: true });
    }
  });

  requestUpdate();
})();

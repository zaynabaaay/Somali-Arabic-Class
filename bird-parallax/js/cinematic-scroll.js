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

  function updateScenes() {
    frameRequested = false;

    if (!scene) return;

    const totalTravel = Math.max(1, scene.offsetHeight - window.innerHeight);
    const scrolled = Math.min(totalTravel, Math.max(0, -scene.getBoundingClientRect().top));
    const previousOpeningTravel = Math.min(
      totalTravel,
      window.innerHeight * (window.innerWidth <= 760 ? 3.6 : 3.8)
    );
    const riverTravel = Math.max(1, totalTravel - previousOpeningTravel);
    const progress = clamp(scrolled / previousOpeningTravel);
    const riverProgress = clamp((scrolled - previousOpeningTravel) / riverTravel);
    const heroDeparture = easeBetween(progress, .2, .35);
    const verseArrival = easeBetween(progress, .5, .58);
    const verseDeparture = easeBetween(progress, .8, .87);
    const bridgeArrival = easeBetween(progress, .84, .89);
    const bridgeDeparture = easeBetween(progress, .915, .985);
    const landscapeReveal = easeBetween(progress, .855, 1);

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
      root.style.setProperty("--landscape-focus-y", `${(58 * riverProgress).toFixed(3)}%`);
      root.style.setProperty("--close-cloud-y", `${(-10 * progress - 132 * closeCloudDeparture).toFixed(3)}vh`);
      root.style.setProperty("--distant-cloud-y", `${(-3.5 * progress - 104 * distantCloudDeparture).toFixed(3)}vh`);
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
  requestUpdate();
})();

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

  function updateOpeningSky() {
    frameRequested = false;

    if (!scene) return;

    const travel = Math.max(1, scene.offsetHeight - window.innerHeight);
    const progress = clamp(-scene.getBoundingClientRect().top / travel);
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
  }

  function requestUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(updateOpeningSky);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  reduceMotion.addEventListener?.("change", requestUpdate);
  requestUpdate();
})();

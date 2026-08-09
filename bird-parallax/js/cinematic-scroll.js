(() => {
  const root = document.documentElement;
  const scene = document.querySelector("#opening-sky");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frameRequested = false;

  function updateOpeningSky() {
    frameRequested = false;

    if (!scene || reduceMotion.matches) {
      root.style.setProperty("--scroll-cue-opacity", "0");
      return;
    }

    const travel = Math.max(1, scene.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -scene.getBoundingClientRect().top / travel));

    root.style.setProperty("--sky-progress", progress.toFixed(4));
    root.style.setProperty("--scroll-cue-opacity", Math.max(0, 1 - progress * 8).toFixed(3));
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

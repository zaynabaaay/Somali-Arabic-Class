const root = document.documentElement;
const atmosphere = document.querySelector(".page-atmosphere");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let frameRequested = false;

function setLayerPosition(name, x, y) {
  root.style.setProperty(`--page-${name}-x`, `${x.toFixed(3)}vw`);
  root.style.setProperty(`--page-${name}-y`, `${y.toFixed(3)}vh`);
}

function renderAtmosphere() {
  frameRequested = false;
  if (!atmosphere || reducedMotion.matches) {
    setLayerPosition("sky", 0, 0);
    setLayerPosition("distant", 0, 0);
    setLayerPosition("close", 0, 0);
    return;
  }

  const viewportHeight = Math.max(window.innerHeight, 1);
  const scrollPhase = window.scrollY / viewportHeight;

  // The deepest layer barely shifts; nearer clouds rise farther and faster.
  setLayerPosition(
    "sky",
    0,
    Math.sin(scrollPhase * 0.24) * -0.7
  );
  setLayerPosition(
    "distant",
    0,
    Math.sin(scrollPhase * 0.82) * -2.8
  );
  setLayerPosition(
    "close",
    0,
    Math.sin(scrollPhase * 1.34) * -7.2
  );
}

function requestRender() {
  if (frameRequested) return;
  frameRequested = true;
  window.requestAnimationFrame(renderAtmosphere);
}

window.addEventListener("scroll", requestRender, { passive: true });
window.addEventListener("resize", requestRender, { passive: true });
reducedMotion.addEventListener("change", requestRender);
requestRender();

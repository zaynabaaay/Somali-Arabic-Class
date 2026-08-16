import {
  cleanHadithReference,
  element,
  renderBeatList,
  renderCitation
} from "./content-renderer.js";

const dataPaths = {
  scenes: "data/part-two-scenes.json",
  quran: "data/part-two-quran.json",
  hadith: "data/part-two-hadith.json"
};

const root = document.querySelector("#part-two-scenes");

function renderSource(scene, data) {
  const source = element("div", "on-screen-source");
  if (scene.source_type === "quran") {
    const passage = data.quran.passages[scene.source_id];
    source.classList.add("quran-source");
    source.append(renderCitation([{
      label: `SURAH ${passage.surah.toUpperCase()} · ${passage.reference}`,
      url: passage.source_url
    }]));
    source.append(renderBeatList(passage.beats, {
      sourceId: scene.source_id,
      markBeat: (_, index, id) => id === "tirmidhi_2450" && index === 1 ? "part-two-final-beat" : ""
    }));
  } else {
    const record = data.hadith.hadith[scene.source_id];
    const beats = record.beats || [{ arabic: record.arabic, english: record.english }];
    source.classList.add("hadith-source");
    source.append(renderCitation([{ label: cleanHadithReference(record.primary_reference), url: record.primary_url }]));
    source.append(renderBeatList(beats, {
      sourceId: scene.source_id,
      markBeat: (_, index, id) => id === "tirmidhi_2450" && index === 1 ? "part-two-final-beat" : ""
    }));
  }
  return source;
}

function renderScene(scene, data) {
  const sceneNode = element("article", "content-scene");
  sceneNode.id = `part-two-${scene.id}`;
  sceneNode.dataset.sceneId = scene.id;

  if (scene.on_screen) {
    const opening = element("header", "part-two-opening");
    opening.append(element("p", "part-two-label", scene.on_screen[0]));
    opening.append(element("h2", "part-two-title", scene.on_screen[1]));
    sceneNode.append(opening);
  } else {
    sceneNode.append(renderSource(scene, data));
  }
  return sceneNode;
}

async function loadPartTwo() {
  if (!root) return;
  try {
    const [scenes, quran, hadith] = await Promise.all(
      Object.values(dataPaths).map(async (path) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Unable to load ${path}`);
        return response.json();
      })
    );

    const fragment = document.createDocumentFragment();
    scenes.scenes.forEach((scene) => fragment.append(renderScene(scene, { quran, hadith })));
    root.replaceChildren(fragment);
  } catch (error) {
    root.replaceChildren(element("p", "content-error", "Part Two could not be loaded."));
    console.error(error);
  }
}

loadPartTwo();

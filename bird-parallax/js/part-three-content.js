import {
  cleanHadithReference,
  element,
  renderBeatList,
  renderCitation
} from "./content-renderer.js";

const dataPaths = {
  scenes: "data/part-three-scenes.json",
  quran: "data/part-three-quran.json",
  hadith: "data/part-three-hadith.json"
};

const root = document.querySelector("#part-three-scenes");

function renderSource(scene, data) {
  const source = element("div", "on-screen-source");
  if (scene.source_type === "quran") {
    const passage = data.quran.passages[scene.source_id];
    source.classList.add("quran-source");
    source.append(renderCitation([{
      label: `SURAH ${passage.surah.toUpperCase()} · ${passage.reference}`,
      url: passage.source_url
    }]));
    source.append(renderBeatList(passage.verses, {
      sourceId: scene.source_id,
      markBeat: (_, index, id) => id === "woman_of_paradise" && index === passage.verses.length - 1 ? "part-three-final-beat" : ""
    }));
  } else {
    const record = data.hadith.hadith[scene.source_id];
    source.classList.add("hadith-source");
    const references = [{
      label: cleanHadithReference(record.primary_reference),
      url: record.primary_url
    }];
    (record.parallel_references || []).forEach((reference) => references.push({
      label: cleanHadithReference(reference.reference),
      url: reference.url
    }));
    source.append(renderCitation(references));
    source.append(renderBeatList(record.beats, {
      sourceId: scene.source_id,
      markBeat: (_, index, id) => id === "woman_of_paradise" && index === record.beats.length - 1 ? "part-three-final-beat" : ""
    }));
  }
  return source;
}

function renderScene(scene, data) {
  const sceneNode = element("article", "content-scene");
  sceneNode.id = `part-three-${scene.id}`;
  sceneNode.dataset.sceneId = scene.id;

  if (scene.on_screen) {
    const opening = element("header", "part-three-opening");
    opening.append(element("p", "part-three-label", scene.on_screen[0]));
    opening.append(element("h2", "part-three-title", scene.on_screen[1]));
    sceneNode.append(opening);
  } else {
    sceneNode.append(renderSource(scene, data));
  }
  return sceneNode;
}

async function loadPartThree() {
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
    root.replaceChildren(element("p", "content-error", "Part Three could not be loaded."));
    console.error(error);
  }
}

loadPartThree();

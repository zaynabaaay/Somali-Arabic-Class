const dataPaths = {
  scenes: "data/part-two-scenes.json",
  quran: "data/part-two-quran.json",
  hadith: "data/part-two-hadith.json"
};

const root = document.querySelector("#part-two-scenes");

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function arabicLine(text) {
  const line = element("p", "source-arabic", text);
  line.lang = "ar";
  line.dir = "rtl";
  return line;
}

function renderBeats(beats, sourceId) {
  const list = element("ol", "source-beats");
  beats.forEach((beat, index) => {
    const item = element("li", "source-beat");
    item.dataset.beat = String(index + 1);
    if (sourceId === "tirmidhi_2450" && index === 1) item.classList.add("part-two-final-beat");
    item.append(arabicLine(beat.arabic));
    item.append(element("blockquote", "source-english", beat.english));
    list.append(item);
  });
  return list;
}

function renderCitation(label, url) {
  const citation = element("header", "source-citation");
  const link = element("a", "source-reference", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  citation.append(link);
  return citation;
}

function cleanHadithReference(reference) {
  return reference.toUpperCase().replace(/ (\d+)[a-z]?$/i, " · $1");
}

function renderSource(scene, data) {
  const source = element("div", "on-screen-source");
  if (scene.source_type === "quran") {
    const passage = data.quran.passages[scene.source_id];
    source.classList.add("quran-source");
    source.append(renderCitation(`SURAH ${passage.surah.toUpperCase()} · ${passage.reference}`, passage.source_url));
    source.append(renderBeats(passage.beats, scene.source_id));
  } else {
    const record = data.hadith.hadith[scene.source_id];
    const beats = record.beats || [{ arabic: record.arabic, english: record.english }];
    source.classList.add("hadith-source");
    source.append(renderCitation(cleanHadithReference(record.primary_reference), record.primary_url));
    source.append(renderBeats(beats, scene.source_id));
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

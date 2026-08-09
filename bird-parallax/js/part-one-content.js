const dataPaths = {
  scenes: "data/part-one-scenes.json",
  quran: "data/part-one-quran.json",
  hadith: "data/part-one-hadith.json"
};

const root = document.querySelector("#part-one-scenes");

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function arabicLine(text, className = "source-arabic") {
  const line = element("p", className, text);
  line.lang = "ar";
  line.dir = "rtl";
  return line;
}

function renderBeatList(beats, sourceId) {
  const list = element("ol", "source-beats");
  beats.forEach((beat, index) => {
    const item = element("li", "source-beat");
    item.dataset.beat = String(index + 1);
    if (sourceId === "greatest_reward" && index === 2) item.classList.add("veil-beat");
    item.append(arabicLine(beat.arabic));
    item.append(element("blockquote", "source-english", beat.english));
    list.append(item);
  });
  return list;
}

function quranReference(passage) {
  return `SURAH ${passage.surah.toUpperCase()} · ${passage.reference}`;
}

function cleanHadithReference(reference) {
  return reference.replace(/(\d+)[a-z]$/i, "$1").toUpperCase();
}

function hadithReference(record) {
  const references = [record.primary_reference, ...(record.parallel_references || []).map((item) => item.reference)]
    .map(cleanHadithReference)
  if (references.length === 1) return references[0].replace(/ (\d+)$/, " · $1");
  return references.join(" · ");
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

function renderQuranPassage(passage, sourceId) {
  const source = element("div", "on-screen-source quran-source");
  source.append(renderCitation(quranReference(passage), passage.source_url));
  source.append(renderBeatList(passage.beats, sourceId));
  return source;
}

function renderHadith(record, sourceId) {
  const source = element("div", "on-screen-source hadith-source");
  const beats = record.beats || [{ arabic: record.arabic, english: record.english }];
  source.append(renderCitation(hadithReference(record), record.primary_url));
  source.append(renderBeatList(beats, sourceId));
  return source;
}

function renderOpening(scene) {
  const opening = element("header", "part-one-opening");
  opening.append(element("p", "part-one-label", scene.on_screen[0]));
  opening.append(element("h1", "part-one-title", scene.on_screen[1]));
  return opening;
}

function renderScene(scene, data) {
  const sceneNode = element("article", "content-scene");
  sceneNode.id = `content-scene-${scene.id}`;
  sceneNode.dataset.sceneId = scene.id;

  if (scene.on_screen) {
    sceneNode.append(renderOpening(scene));
    return sceneNode;
  }

  if (scene.opening_lines?.length) {
    const setup = element("div", "editorial-setup");
    scene.opening_lines.forEach((line) => setup.append(element("p", "editorial-setup-line", line)));
    sceneNode.append(setup);
  }

  if (scene.source_type === "quran") {
    sceneNode.append(renderQuranPassage(data.quran.passages[scene.source_id], scene.source_id));
  } else if (scene.source_type === "hadith") {
    sceneNode.append(renderHadith(data.hadith.hadith[scene.source_id], scene.source_id));
  }

  return sceneNode;
}

async function loadPartOne() {
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
    root.replaceChildren(element("p", "content-error", "Part One could not be loaded."));
    console.error(error);
  }
}

loadPartOne();

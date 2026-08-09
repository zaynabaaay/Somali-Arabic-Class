const dataPaths = {
  scenes: "data/part-three-scenes.json",
  quran: "data/part-three-quran.json",
  hadith: "data/part-three-hadith.json"
};

const root = document.querySelector("#part-three-scenes");

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
    if (sourceId === "woman_of_paradise" && index === beats.length - 1) {
      item.classList.add("part-three-final-beat");
    }
    item.append(arabicLine(beat.arabic));
    item.append(element("blockquote", "source-english", beat.english));
    list.append(item);
  });
  return list;
}

function cleanHadithReference(reference) {
  return reference.toUpperCase().replace(/ (\d+)[a-z]?$/i, " · $1");
}

function citationLink(label, url) {
  const link = element("a", "source-reference", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  return link;
}

function renderCitation(references) {
  const citation = element("header", "source-citation");
  references.forEach((reference) => citation.append(citationLink(reference.label, reference.url)));
  return citation;
}

function renderSource(scene, data) {
  const source = element("div", "on-screen-source");
  if (scene.source_type === "quran") {
    const passage = data.quran.passages[scene.source_id];
    source.classList.add("quran-source");
    source.append(renderCitation([{
      label: `SURAH ${passage.surah.toUpperCase()} · ${passage.reference}`,
      url: passage.source_url
    }]));
    source.append(renderBeats(passage.verses, scene.source_id));
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
    source.append(renderBeats(record.beats, scene.source_id));
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

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

function sourceReference(label, url) {
  const link = element("a", "source-reference", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  return link;
}

function arabicLine(text, className = "source-arabic") {
  const line = element("p", className, text);
  line.lang = "ar";
  line.dir = "rtl";
  return line;
}

function renderBeatList(beats) {
  const list = element("ol", "source-beats");
  beats.forEach((beat, index) => {
    const item = element("li", "source-beat");
    item.dataset.beat = String(index + 1);
    item.append(element("p", "beat-marker", `Beat ${index + 1}`));
    if (typeof beat === "string") {
      item.append(element("blockquote", "source-english", beat));
    } else {
      item.append(arabicLine(beat.arabic));
      item.append(element("blockquote", "source-english", beat.english));
    }
    list.append(item);
  });
  return list;
}

function renderQuranPassage(scene, passage) {
  const source = element("div", "on-screen-source quran-source");
  source.append(element("p", "source-content-label", "Qur’an · Sahih International"));

  if (passage.beats) {
    source.append(renderBeatList(passage.beats));
  } else {
    passage.groups.forEach((group, groupIndex) => {
      const groupNode = element("section", "verse-group");
      groupNode.dataset.group = String(group.id);
      const groupLabel = scene.group_labels?.[groupIndex];
      if (groupLabel) {
        groupNode.append(element("h4", "editorial-group-label", `Group ${group.id} · ${groupLabel}`));
      }
      const verses = element("ol", "verse-list");
      passage.verses
        .filter((verse) => verse.verse_number >= group.first && verse.verse_number <= group.last)
        .forEach((verse) => {
          const item = element("li", "verse-pair");
          item.value = verse.verse_number;
          item.dataset.verse = verse.verse_key;
          item.append(element("p", "beat-marker", `Verse ${verse.verse_key}`));
          item.append(arabicLine(verse.arabic, "verse-arabic"));
          item.append(element("p", "verse-english", verse.english));
          verses.append(item);
        });
      groupNode.append(verses);
      source.append(groupNode);
    });
  }

  const citation = element("footer", "source-citation");
  citation.append(sourceReference(`Surah ${passage.surah} — ${passage.reference}`, passage.source_url));
  citation.append(element("span", "translation-credit", "Sahih International"));
  source.append(citation);
  return source;
}

function renderHadithCitation(record) {
  const citation = element("footer", "source-citation");
  citation.append(sourceReference(record.primary_reference, record.primary_url));
  record.parallel_references?.forEach((parallel) => {
    citation.append(sourceReference(parallel.reference, parallel.url));
  });
  return citation;
}

function renderHadith(scene, record) {
  const source = element("div", "on-screen-source hadith-source");
  source.append(element("p", "source-content-label", `Hadith · ${record.primary_reference}`));

  if (record.beats) {
    if (record.beats.some((beat) => typeof beat === "string")) {
      const arabicBeat = element("section", "source-beat hadith-arabic-beat");
      arabicBeat.append(element("p", "beat-marker", "Arabic source text"));
      arabicBeat.append(arabicLine(record.arabic, "source-arabic source-arabic-full"));
      source.append(arabicBeat);
    }
    source.append(renderBeatList(record.beats));
  } else {
    const singleBeat = element("section", "source-beat hadith-single-beat");
    singleBeat.append(element("p", "beat-marker", "Beat 1"));
    singleBeat.append(arabicLine(record.arabic, "source-arabic source-arabic-full"));
    singleBeat.append(element("blockquote", "source-english source-english-feature", record.english));
    source.append(singleBeat);
  }
  source.append(renderHadithCitation(record));

  if (record.supporting_narration) {
    const supporting = element("section", "supporting-narration");
    supporting.append(element("h4", "supporting-heading", "Separate supporting narration"));
    const supportingBeat = element("section", "source-beat");
    supportingBeat.append(element("p", "beat-marker", "Supporting beat"));
    supportingBeat.append(arabicLine(record.supporting_narration.arabic, "source-arabic source-arabic-full"));
    supportingBeat.append(element("blockquote", "source-english", record.supporting_narration.english));
    supporting.append(supportingBeat);
    const supportingCitation = element("footer", "source-citation");
    supportingCitation.append(sourceReference(record.supporting_narration.reference, record.supporting_narration.url));
    supporting.append(supportingCitation);
    source.append(supporting);
  }

  return source;
}

function renderScene(scene, data) {
  const sceneNode = element("article", `content-scene scene-${scene.number}`);
  sceneNode.id = `content-scene-${scene.number}-${scene.id}`;
  sceneNode.dataset.scene = String(scene.number);

  if (scene.number !== 1) {
    const header = element("header", "content-scene-header");
    header.append(element("p", "scene-number", `Scene ${scene.number}`));
    scene.opening_lines?.forEach((line) => header.append(element("p", "scene-opening-line", line)));
    header.append(element("h3", "content-scene-title", scene.heading));
    sceneNode.append(header);
  }

  if (scene.on_screen) {
    const source = element("div", "on-screen-source opening-source");
    source.append(element("p", "source-content-label", `${scene.eyebrow} · ${scene.heading}`));
    scene.on_screen.forEach((line, index) => {
      const item = element(index === 0 ? "p" : "p", index === 0 ? "opening-arabic" : "opening-line", line);
      if (index === 0) {
        item.lang = "ar";
        item.dir = "rtl";
      }
      source.append(item);
    });
    sceneNode.append(source);
  } else if (scene.source_type === "quran") {
    sceneNode.append(renderQuranPassage(scene, data.quran.passages[scene.source_id]));
  } else if (scene.source_type === "hadith") {
    sceneNode.append(renderHadith(scene, data.hadith.hadith[scene.source_id]));
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

    root.replaceChildren();
    const fragment = document.createDocumentFragment();
    scenes.scenes.forEach((scene) => fragment.append(renderScene(scene, { quran, hadith })));
    const ending = element("footer", "part-one-ending");
    ending.append(element("p", "part-one-ending-label", "End of Part One"));
    ending.append(element("p", "part-one-ending-statement", "and of things given to them nothing would he dearer to them than the sight of their Lord, the Mighty and the Glorious."));
    fragment.append(ending);
    root.append(fragment);
  } catch (error) {
    root.replaceChildren(element("p", "content-error", "Part One source content could not be loaded. The verified source files remain available in the project data directory."));
    console.error(error);
  }
}

loadPartOne();

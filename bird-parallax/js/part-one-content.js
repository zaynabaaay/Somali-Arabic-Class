const dataPaths = {
  scenes: "data/part-one-scenes.json",
  quran: "data/part-one-quran.json",
  hadith: "data/part-one-hadith.json",
  notes: "data/part-one-presenter-notes.json"
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

function appendPresenterNotes(sceneNode, paragraphs) {
  const notes = element("details", "presenter-notes");
  notes.append(element("summary", "presenter-notes-label", "Presenter notes · development only"));
  const body = element("div", "presenter-notes-body");
  paragraphs.forEach((paragraph) => body.append(element("p", "", paragraph)));
  notes.append(body);
  sceneNode.append(notes);
}

function renderBeatList(beats) {
  const list = element("ol", "source-beats");
  beats.forEach((beat, index) => {
    const item = element("li", "source-beat");
    item.dataset.beat = String(index + 1);
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
  source.append(element("p", "source-content-label", "On-screen source content · Qur’an"));

  if (passage.beats) {
    source.append(renderBeatList(passage.beats));
  } else {
    passage.groups.forEach((group, groupIndex) => {
      const groupNode = element("section", "verse-group");
      groupNode.dataset.group = String(group.id);
      const groupLabel = scene.group_labels?.[groupIndex];
      if (groupLabel) {
        groupNode.append(element("h4", "editorial-group-label", `Editorial grouping · ${groupLabel}`));
      }
      const verses = element("ol", "verse-list");
      passage.verses
        .filter((verse) => verse.verse_number >= group.first && verse.verse_number <= group.last)
        .forEach((verse) => {
          const item = element("li", "verse-pair");
          item.value = verse.verse_number;
          item.dataset.verse = verse.verse_key;
          item.append(arabicLine(verse.arabic, "verse-arabic"));
          item.append(element("p", "verse-english", verse.english));
          item.append(element("span", "verse-number", verse.verse_key));
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
  source.append(element("p", "source-content-label", `On-screen source content · ${record.label}`));

  if (record.beats) source.append(renderBeatList(record.beats));
  else source.append(element("blockquote", "source-english source-english-feature", record.english));

  const fullArabic = element("details", "full-source-text");
  fullArabic.append(element("summary", "full-source-label", "Exact Arabic source text"));
  fullArabic.append(arabicLine(record.arabic, "source-arabic source-arabic-full"));
  source.append(fullArabic);
  source.append(renderHadithCitation(record));

  if (record.supporting_narration) {
    const supporting = element("section", "supporting-narration");
    supporting.append(element("h4", "supporting-heading", "Separate supporting narration"));
    supporting.append(element("blockquote", "source-english", record.supporting_narration.english));
    const supportingArabic = element("details", "full-source-text");
    supportingArabic.append(element("summary", "full-source-label", "Exact Arabic source text"));
    supportingArabic.append(arabicLine(record.supporting_narration.arabic, "source-arabic source-arabic-full"));
    supporting.append(supportingArabic);
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

  const header = element("header", "content-scene-header");
  header.append(element("p", "scene-number", `Scene ${scene.number}`));
  scene.opening_lines?.forEach((line) => header.append(element("p", "scene-opening-line", line)));
  header.append(element(scene.number === 1 ? "h2" : "h3", "content-scene-title", scene.heading));
  sceneNode.append(header);

  if (scene.on_screen) {
    const source = element("div", "on-screen-source opening-source");
    source.append(element("p", "source-content-label", "On-screen editorial content"));
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

  appendPresenterNotes(sceneNode, data.notes.scenes[scene.id]);
  return sceneNode;
}

async function loadPartOne() {
  if (!root) return;
  try {
    const [scenes, quran, hadith, notes] = await Promise.all(
      Object.values(dataPaths).map(async (path) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Unable to load ${path}`);
        return response.json();
      })
    );

    root.replaceChildren();
    const fragment = document.createDocumentFragment();
    scenes.scenes.forEach((scene) => fragment.append(renderScene(scene, { quran, hadith, notes })));
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

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function arabicLine(text, className = "source-arabic") {
  const line = element("p", className, text);
  line.lang = "ar";
  line.dir = "rtl";
  return line;
}

export function renderBeatList(beats, { sourceId, markBeat } = {}) {
  const list = element("ol", "source-beats");
  beats.forEach((beat, index) => {
    const item = element("li", "source-beat");
    item.dataset.beat = String(index + 1);
    const markerClass = markBeat?.(beat, index, sourceId);
    if (markerClass) item.classList.add(markerClass);
    item.append(arabicLine(beat.arabic));
    item.append(element("blockquote", "source-english", beat.english));
    list.append(item);
  });
  return list;
}

export function cleanHadithReference(reference) {
  return reference.toUpperCase().replace(/ (\d+)[a-z]?$/i, " · $1");
}

export function citationLink(label, url) {
  const link = element("a", "source-reference", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  return link;
}

export function renderCitation(references) {
  const citation = element("header", "source-citation");
  references.forEach(({ label, url }) => citation.append(citationLink(label, url)));
  return citation;
}

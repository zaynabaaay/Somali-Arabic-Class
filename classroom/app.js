const words = {
  hello: {
    somali: "Salaan",
    somaliHint: "sah-LAAN",
    arabic: "مَرْحَبًا",
    arabicHint: "mar-ha-ban",
    note: "A warm greeting opens every class—and every friendship."
  },
  thanks: {
    somali: "Mahadsanid",
    somaliHint: "ma-had-sa-NID",
    arabic: "شُكْرًا",
    arabicHint: "shuk-ran",
    note: "Gratitude sounds beautiful in every language."
  },
  family: {
    somali: "Qoys",
    somaliHint: "qoys",
    arabic: "عَائِلَة",
    arabicHint: "aa-i-lah",
    note: "Family is where many of our first words—and stories—begin."
  },
  book: {
    somali: "Buug",
    somaliHint: "boog",
    arabic: "كِتَاب",
    arabicHint: "ki-taab",
    note: "Every book is a doorway into language, memory and imagination."
  }
};

const explored = new Set();
const tabs = document.querySelectorAll(".word-tab");
const somaliWord = document.querySelector("#somaliWord");
const somaliHint = document.querySelector("#somaliHint");
const arabicWord = document.querySelector("#arabicWord");
const arabicHint = document.querySelector("#arabicHint");
const wordNote = document.querySelector("#wordNote");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");

function showWord(key) {
  const word = words[key];
  if (!word) return;

  explored.add(key);
  somaliWord.textContent = word.somali;
  somaliHint.textContent = word.somaliHint;
  arabicWord.textContent = word.arabic;
  arabicHint.textContent = word.arabicHint;
  wordNote.textContent = word.note;
  progressText.textContent = `${explored.size} / ${tabs.length}`;
  progressBar.style.width = `${(explored.size / tabs.length) * 100}%`;

  tabs.forEach((tab) => {
    const active = tab.dataset.word === key;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

tabs.forEach((tab) => tab.addEventListener("click", () => showWord(tab.dataset.word)));
document.querySelector("#year").textContent = new Date().getFullYear();

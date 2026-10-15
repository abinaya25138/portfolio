// ---------------------------------------------------------------------------
// Rotating identity line in the hero
// ---------------------------------------------------------------------------
const ROLES = [
  "Data Engineer Analyst @ BlackRock",
  "Bharatanatyam dancer, 14 years",
  "Builder of things that didn't exist yet"
];
let roleIndex = 0;
const roleEl = document.getElementById('role-text');
setInterval(() => {
  roleIndex = (roleIndex + 1) % ROLES.length;
  if (roleEl) roleEl.textContent = ROLES[roleIndex];
}, 2600);

// ---------------------------------------------------------------------------
// Mobile nav toggle
// ---------------------------------------------------------------------------
const navToggle = document.getElementById('nav-toggle');
const navLinksEl = document.getElementById('nav-links');
if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinksEl.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navLinksEl.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---------------------------------------------------------------------------
// Reveal-on-scroll + active nav section, via one IntersectionObserver
// ---------------------------------------------------------------------------
const SECTION_IDS = ['top', 'stats', 'journey', 'about', 'experience', 'skills', 'projects', 'demos', 'results', 'beyond', 'outside', 'contact'];
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));

function setActiveNav(id) {
  navLinks.forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === id);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        setActiveNav(entry.target.id);
        if (entry.target.id === 'stats') startCountUp();
      }
    });
  },
  { rootMargin: '-35% 0px -40% 0px', threshold: 0 }
);

SECTION_IDS.forEach((id) => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

// reveal anything already in view on load, so there's no flash of hidden content above the fold
window.addEventListener('DOMContentLoaded', () => {
  const vh = window.innerHeight;
  SECTION_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < vh) {
      el.classList.add('visible');
      if (id === 'stats') startCountUp();
    }
  });
});

// ---------------------------------------------------------------------------
// Stats bar count-up
// ---------------------------------------------------------------------------
const STAT_TARGETS = { projects: 8, accuracy: 98.2, clients: 200, years: 14 };
let countStarted = false;

function startCountUp() {
  if (countStarted) return;
  countStarted = true;
  const duration = 1400;
  const start = performance.now();
  const elProjects = document.getElementById('stat-projects');
  const elAccuracy = document.getElementById('stat-accuracy');
  const elClients = document.getElementById('stat-clients');
  const elYears = document.getElementById('stat-years');

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    if (elProjects) elProjects.textContent = Math.round(STAT_TARGETS.projects * eased);
    if (elAccuracy) elAccuracy.textContent = (STAT_TARGETS.accuracy * eased).toFixed(1);
    if (elClients) elClients.textContent = Math.round(STAT_TARGETS.clients * eased);
    if (elYears) elYears.textContent = Math.round(STAT_TARGETS.years * eased);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// "Show more" toggle on the BlackRock experience entry
// ---------------------------------------------------------------------------
const tlMoreBtn = document.getElementById('tl-more-btn');
const tlExtra = document.getElementById('tl-extra');
if (tlMoreBtn && tlExtra) {
  tlMoreBtn.addEventListener('click', () => {
    const expanded = tlExtra.classList.toggle('hidden') === false;
    tlMoreBtn.textContent = expanded ? 'Show less ←' : 'Show 3 more →';
  });
}

// ---------------------------------------------------------------------------
// Project filter
// ---------------------------------------------------------------------------
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const projectCards = Array.from(document.querySelectorAll('.project-card'));

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    let visibleIndex = 0;
    projectCards.forEach((card) => {
      const matches = filter === 'All' || card.dataset.category === filter;
      card.classList.toggle('hidden', !matches);
      if (matches) {
        card.style.transitionDelay = Math.min(visibleIndex, 7) * 50 + 'ms';
        visibleIndex++;
      }
    });
  });
});

// ---------------------------------------------------------------------------
// Live demo 1 — NLTK-style retrieval chatbot
// ---------------------------------------------------------------------------
const CORPUS = [
  "natural language processing is a field of artificial intelligence focused on enabling computers to understand interpret and generate human language",
  "tokenization is the process of breaking text into smaller units such as words or sentences it is usually the first step in any nlp pipeline",
  "lemmatization reduces a word to its base or dictionary form known as a lemma while preserving its meaning",
  "tfidf short for term frequency inverse document frequency is a statistical measure used to evaluate how important a word is to a document relative to a collection of documents",
  "cosine similarity measures the similarity between two nonzero vectors by calculating the cosine of the angle between them it is widely used in text retrieval and chatbot response matching",
  "named entity recognition identifies and classifies key information in text into predefined categories such as names of people organizations and locations",
  "a chatbot is a software application that simulates human conversation through text or voice interactions retrieval based chatbots select the most relevant response from a fixed set of responses based on the input they receive",
  "spell correction improves the quality of user input by detecting and fixing typographical errors before the text is processed further",
  "machine learning models improve their performance on a task through experience typically by learning patterns from data rather than following explicitly programmed rules"
];

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function computeReply(input) {
  const greetRe = /(hello|hi|whatsup|how are you|hey|good evening|greetings|howdy)/i;
  if (greetRe.test(input)) {
    const greetings = ['Hello!', 'Hi there!', 'Hey!', 'Greetings!'];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  const inputWords = tokenize(input);
  let best = null, bestScore = 0;
  for (const sentence of CORPUS) {
    const words = tokenize(sentence);
    const shared = inputWords.filter((w) => words.includes(w)).length;
    const score = shared / Math.sqrt((inputWords.length * words.length) || 1);
    if (score > bestScore) { bestScore = score; best = sentence; }
  }
  if (bestScore === 0 || !best) {
    return "I'm not sure about that — try asking about tokenization, TF-IDF, chatbots, or NLP.";
  }
  return best;
}

const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

function appendChatMessage(from, text) {
  const div = document.createElement('div');
  div.className = 'chat-msg ' + from;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function sendChat() {
  const draft = chatInput.value.trim();
  if (!draft) return;
  appendChatMessage('user', draft);
  appendChatMessage('bot', computeReply(draft));
  chatInput.value = '';
}

if (chatSend) chatSend.addEventListener('click', sendChat);
if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });

// ---------------------------------------------------------------------------
// Live demo 2 — Jaccard similarity fuzzy search
// ---------------------------------------------------------------------------
const TAGS = [
  "Conveyor Belt Motor Temperature",
  "Cooling Fan Speed Sensor",
  "Hydraulic Pump Pressure Gauge",
  "Compressor Vibration Monitor",
  "Boiler Water Level Indicator"
];

function jaccard(a, b) {
  const sa = new Set(a.toLowerCase());
  const sb = new Set(b.toLowerCase());
  const inter = [...sa].filter((c) => sb.has(c)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
}

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

function renderSearchResults() {
  const q = searchInput.value.trim();
  const scored = TAGS.map((t) => ({ text: t, score: q ? jaccard(q, t) : 0 }));
  if (q) scored.sort((a, b) => b.score - a.score);

  searchResults.innerHTML = '';
  scored.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'search-row';
    const label = document.createElement('span');
    label.className = 'search-label';
    label.textContent = r.text;
    const track = document.createElement('div');
    track.className = 'search-bar-track';
    const fill = document.createElement('div');
    fill.className = 'search-bar-fill';
    fill.style.width = Math.round(r.score * 100) + '%';
    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    searchResults.appendChild(row);
  });
}

if (searchInput) {
  searchInput.addEventListener('input', renderSearchResults);
  renderSearchResults();
}

import { REVIEWED_ON, opportunities, estimateStudentBranchRebate, filterOpportunities } from "./opportunities.mjs";
import { eventExamples, filterEventExamples } from "./events.mjs";

const root = document.documentElement;
const list = document.querySelector("#opportunity-list");
const search = document.querySelector("#funding-search");
const count = document.querySelector("#result-count");
const empty = document.querySelector("#empty-state");
const moreButton = document.querySelector("#show-more");
const travelOnly = document.querySelector("#travel-only");
const catalogStatus = document.querySelector("#catalog-status");
const catalogHeading = document.querySelector("#catalog-heading");
const catalogResults = document.querySelector("#catalog-results");
const buttons = [...document.querySelectorAll("[data-filter]")];
const eventGrid = document.querySelector("#event-grid");
const eventCount = document.querySelector("#events-count");
const moreEventsButton = document.querySelector("#show-more-events");
const eventFilterButtons = [...document.querySelectorAll("[data-event-filter]")];
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-nav");
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const progressBar = document.querySelector(".scroll-progress span");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const compact = window.matchMedia("(max-width: 680px)");
const previewCount = () => (compact.matches ? 4 : 9);
const eventPreviewCount = () => (compact.matches ? 4 : eventExamples.length);
const tones = ["blue", "teal", "amber", "coral"];
let activeCategory = "all";
let showAll = false;
let showAllEvents = false;
let catalogTimer;
let catalogRequest;
let lastCatalogEntries = [];
let activeEventCategory = "all";

const statusLabels = { open: "Open at last check", closed: "Closed in 2026", recurring: "Annual cycle", check: "Check next cycle" };
const eventCategoryLabels = { "student-branch": "Student Branch", society: "Society chapter", "kerala-wide": "Kerala-wide" };
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

function renderOpportunity(item, index) {
  const status = item.status;
  const card = document.createElement("article");
  card.className = "opportunity-card";
  card.setAttribute("role", "listitem");
  card.style.setProperty("--i", Math.min(index, 9));
  card.innerHTML = `
    <div class="opp-top"><span class="opp-status status-${status}"></span>${item.travel ? `<span class="opp-tag">Travel</span>` : ""}</div>
    <div class="opp-primary"><h3 class="opp-title"></h3><p class="opp-type"></p></div>
    <dl class="opp-facts">
      <div><dt>Amount</dt><dd class="opp-amount"></dd></div>
      <div><dt>Opening, closing, cycle</dt><dd class="opp-window"></dd></div>
    </dl>
    <div><span class="opp-label">Best fit and eligibility</span><p class="opp-fit"></p><small class="opp-eligibility"></small></div>
    <a class="opp-source" target="_blank" rel="noopener noreferrer"><span></span>${icon("arrow-up-right")}</a>`;
  card.querySelector(".opp-title").textContent = item.title;
  card.querySelector(".opp-type").textContent = item.type;
  card.querySelector(".opp-type").textContent += ` · ${item.organization}`;
  card.querySelector(".opp-status").textContent = statusLabels[status];
  card.querySelector(".opp-amount").textContent = item.amount;
  card.querySelector(".opp-window").textContent = item.window;
  card.querySelector(".opp-fit").textContent = item.fit;
  card.querySelector(".opp-eligibility").textContent = item.eligibility;
  const source = card.querySelector(".opp-source");
  source.href = item.source;
  source.querySelector("span").textContent = item.sourceLabel;
  return card;
}

function renderEventExample(item, index) {
  const card = document.createElement("article");
  card.className = `event-card tone-${tones[index % tones.length]}`;
  card.setAttribute("role", "listitem");
  card.style.setProperty("--i", Math.min(index, 9));
  card.innerHTML = `<div class="event-card-top"><span class="event-format"></span><span class="event-edition"></span></div>
    <h3 class="event-title"></h3><p class="event-organizers"></p><p class="event-summary"></p>
    <div class="event-takeaway"><strong>${icon("bulb")}Idea to borrow</strong><p></p></div>
    <div class="event-card-bottom"><div class="event-tags"></div><a class="event-source" target="_blank" rel="noopener noreferrer"><span></span>${icon("arrow-up-right")}</a></div>`;
  card.querySelector(".event-format").textContent = item.format;
  card.querySelector(".event-edition").textContent = item.edition;
  card.querySelector(".event-title").textContent = item.title;
  card.querySelector(".event-organizers").textContent = item.organizers;
  card.querySelector(".event-summary").textContent = item.summary;
  card.querySelector(".event-takeaway p").textContent = item.takeaway;
  card.querySelector(".event-tags").append(...item.categories.filter((category) => eventCategoryLabels[category]).map((category) => {
    const tag = document.createElement("span");
    tag.textContent = eventCategoryLabels[category];
    return tag;
  }));
  const source = card.querySelector(".event-source");
  source.href = item.source;
  source.querySelector("span").textContent = item.sourceLabel;
  return card;
}

function updateEventExamples() {
  const filtered = filterEventExamples(eventExamples, activeEventCategory);
  const visible = showAllEvents ? filtered : filtered.slice(0, eventPreviewCount());
  eventGrid.replaceChildren(...visible.map(renderEventExample));
  eventCount.textContent = visible.length < filtered.length
    ? `Showing ${visible.length} of ${filtered.length} documented examples`
    : `${filtered.length} of ${eventExamples.length} documented examples`;
  moreEventsButton.hidden = filtered.length <= eventPreviewCount();
  moreEventsButton.textContent = showAllEvents ? "Show fewer" : `Show all ${filtered.length} examples`;
  moreEventsButton.setAttribute("aria-expanded", String(showAllEvents));
}

function safeText(markup) {
  return new DOMParser().parseFromString(markup || "", "text/html").body.textContent.replace(/\s+/g, " ").trim();
}

function renderCatalogEntry(entry) {
  if (typeof entry.link !== "string") return null;
  let url;
  try {
    url = new URL(entry.link);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== "students.ieee.org") return null;
  const card = document.createElement("article");
  card.className = "live-result-row";
  card.setAttribute("role", "listitem");
  const title = document.createElement("h4");
  title.textContent = safeText(entry.title?.rendered);
  const summary = document.createElement("p");
  summary.textContent = safeText(entry.excerpt?.rendered) || "Open the official listing for current details, eligibility, amount, and cycle dates.";
  const body = document.createElement("div");
  body.append(title, summary);
  const meta = document.createElement("small");
  meta.className = "live-result-meta";
  meta.textContent = "Official IEEE Students catalogue result. Confirm current cycle and eligibility on the linked page.";
  body.append(meta);
  const source = document.createElement("a");
  source.href = url.href;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = "Open official listing ↗";
  card.append(body, source);
  return card;
}

function renderCatalogEntries(entries, visibleLocal) {
  const localUrls = new Set(visibleLocal.map((item) => item.source));
  const unique = entries.filter((entry) => !localUrls.has(entry.link));
  catalogResults.replaceChildren(...unique.map(renderCatalogEntry).filter(Boolean));
  catalogHeading.hidden = unique.length === 0;
  if (entries.length > 0) {
    catalogStatus.textContent = unique.length
      ? `${unique.length} live catalogue result${unique.length === 1 ? "" : "s"}. Status buttons filter only the reviewed shortlist; the official listing controls current availability, amount, eligibility, and dates.`
      : "Your matching catalogue entries are already shown in the reviewed shortlist above.";
    catalogStatus.classList.remove("is-error");
  }
}

function updateList() {
  const filtered = filterOpportunities(opportunities, { category: activeCategory, query: search.value, travelOnly: travelOnly.checked });
  const visible = showAll ? filtered : filtered.slice(0, previewCount());
  list.replaceChildren(...visible.map(renderOpportunity));
  count.textContent = visible.length < filtered.length
    ? `Showing ${visible.length} of ${filtered.length} ${filtered.length === opportunities.length ? "reviewed" : "matching"} opportunities`
    : `${filtered.length} of ${opportunities.length} reviewed opportunities shown`;
  empty.hidden = filtered.length > 0;
  moreButton.hidden = filtered.length <= previewCount();
  moreButton.textContent = showAll ? "Show fewer" : `Show all ${filtered.length} opportunities`;
  moreButton.setAttribute("aria-expanded", String(showAll));
  renderCatalogEntries(lastCatalogEntries, filtered);
}

async function searchLiveCatalog() {
  const term = search.value.trim();
  const isTravelSearch = travelOnly.checked;
  const query = isTravelSearch ? [term, "travel grant"].filter(Boolean).join(" ") : term;
  if (query.length < 2) {
    lastCatalogEntries = [];
    renderCatalogEntries([], filterOpportunities(opportunities, { category: activeCategory, query: term, travelOnly: travelOnly.checked }));
    catalogStatus.textContent = "Status buttons filter the reviewed shortlist. Enter at least two characters to search IEEE Students' live funding catalogue. Your query is sent to students.ieee.org.";
    catalogStatus.classList.remove("is-error");
    return;
  }

  catalogRequest?.abort();
  catalogRequest = new AbortController();
  catalogStatus.textContent = "Searching the live IEEE Students catalogue…";
  catalogStatus.classList.remove("is-error");
  const params = new URLSearchParams({
    categories: "7,10,8,11,9,12,43",
    search: query,
    per_page: "30",
    _fields: "id,link,title,excerpt"
  });

  try {
    const response = await fetch(`https://students.ieee.org/wp-json/wp/v2/posts?${params}`, { signal: catalogRequest.signal });
    if (!response.ok) throw new Error(`Catalogue returned ${response.status}`);
    const entries = await response.json();
    if (search.value.trim() !== term || travelOnly.checked !== isTravelSearch) return;
    lastCatalogEntries = Array.isArray(entries) ? entries : [];
    updateList();
    if (lastCatalogEntries.length === 0) {
      catalogStatus.textContent = "No live IEEE Students catalogue results for this search. Try a broader term or open the full catalogue. Status buttons filter only the reviewed shortlist.";
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    lastCatalogEntries = [];
    renderCatalogEntries([], filterOpportunities(opportunities, { category: activeCategory, query: term, travelOnly: travelOnly.checked }));
    catalogStatus.textContent = "The live IEEE Students catalogue could not be reached. The reviewed shortlist above is still available.";
    catalogStatus.classList.add("is-error");
  }
}

function scheduleCatalogSearch() {
  clearTimeout(catalogTimer);
  catalogTimer = setTimeout(searchLiveCatalog, 300);
}

const branchMembers = document.querySelector("#branch-members");
const rebateOutput = document.querySelector("#rebate-output");
const rebateFigure = document.querySelector("#rebate-figure");
const rebateAmount = document.querySelector("#rebate-amount");
const rebateBreakdown = document.querySelector("#rebate-breakdown");
const rebateResult = document.querySelector("#rebate-result");
const readiness = ["#plan-submitted", "#activities-reported", "#officers-current"].map((selector) => document.querySelector(selector));
const readinessMeter = document.querySelector("#readiness-meter");
const coreDues = document.querySelector("#core-dues");
const poolResult = document.querySelector("#pool-result");
const money = (amount) => `US$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function showRebate(state, message, estimate = null, members = 0) {
  rebateOutput.dataset.state = state;
  rebateResult.textContent = message;
  rebateFigure.hidden = estimate === null;
  if (estimate === null) return;
  rebateAmount.textContent = money(estimate);
  rebateBreakdown.textContent = `US$${estimate - members * 2} allotment + ${members.toLocaleString("en-US")} × US$2`;
}

function updateRebateEstimate() {
  const complete = readiness.filter((checkbox) => checkbox.checked).length;
  readinessMeter.querySelector(".meter-label").textContent = `${complete} of ${readiness.length} checks complete`;
  readinessMeter.querySelectorAll(".meter-bar i").forEach((segment, index) => segment.classList.toggle("is-on", index < complete));
  if (branchMembers.value === "") {
    showRebate("empty", "Enter the prior-year member count to see a planning estimate.");
    return;
  }
  const countValue = Number(branchMembers.value);
  const estimate = estimateStudentBranchRebate(countValue);
  if (!Number.isInteger(countValue) || countValue > 100000) {
    showRebate("error", "Enter a whole-number member count between 12 and 100,000.");
  } else if (estimate === null) {
    showRebate("error", "The published Student Branch minimum is 12 Student or Graduate Student members. No rebate estimate is shown below that threshold.");
  } else if (complete === readiness.length) {
    showRebate("ready", `Formula-based estimate: ${money(estimate)}. The Section must confirm the branch's good standing and actual payment.`, estimate, countValue);
  } else {
    showRebate("pending", `Potential estimate if all reporting checks are complete: ${money(estimate)}. This is not a payable amount until the Section confirms eligibility.`, estimate, countValue);
  }
}

function updatePoolEstimate() {
  if (coreDues.value === "") {
    poolResult.dataset.state = "empty";
    poolResult.textContent = "Add core dues to see the illustrative 12% MGA pool share.";
    return;
  }
  const dues = Number(coreDues.value);
  if (!Number.isFinite(dues) || dues < 0) {
    poolResult.dataset.state = "error";
    poolResult.textContent = "Enter a non-negative core IEEE dues amount.";
    return;
  }
  poolResult.dataset.state = "filled";
  poolResult.textContent = `Illustrative 12% aggregate MGA allocation: ${money(dues * .12)}. This is not the amount paid to one Branch, Section, Council, or Region.`;
}

branchMembers.addEventListener("input", updateRebateEstimate);
readiness.forEach((checkbox) => checkbox.addEventListener("change", updateRebateEstimate));
coreDues.addEventListener("input", updatePoolEstimate);

function addFilterCount(button, total) {
  const badge = document.createElement("span");
  badge.className = "filter-count";
  badge.textContent = total;
  button.append(" ", badge);
}

buttons.forEach((button) => {
  addFilterCount(button, filterOpportunities(opportunities, { category: button.dataset.filter }).length);
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;
    buttons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    updateList();
  });
});
search.addEventListener("input", () => {
  lastCatalogEntries = [];
  updateList();
  scheduleCatalogSearch();
});
travelOnly.addEventListener("change", () => {
  lastCatalogEntries = [];
  updateList();
  scheduleCatalogSearch();
});
moreButton.addEventListener("click", () => {
  showAll = !showAll;
  updateList();
  if (!showAll) document.querySelector(".funding-tools").scrollIntoView({ block: "start" });
});
moreEventsButton.addEventListener("click", () => {
  showAllEvents = !showAllEvents;
  updateEventExamples();
  if (!showAllEvents) document.querySelector(".events-tools").scrollIntoView({ block: "start" });
});
compact.addEventListener("change", () => {
  updateList();
  updateEventExamples();
});

eventFilterButtons.forEach((button) => {
  addFilterCount(button, filterEventExamples(eventExamples, button.dataset.eventFilter).length);
  button.addEventListener("click", () => {
    activeEventCategory = button.dataset.eventFilter;
    eventFilterButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    updateEventExamples();
  });
});

menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menuButton.querySelector(".sr-only").textContent = expanded ? "Open navigation" : "Close navigation";
  menu.classList.toggle("is-open", !expanded);
});
menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.querySelector(".sr-only").textContent = "Open navigation";
    menu.classList.remove("is-open");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.querySelector(".sr-only").textContent = "Open navigation";
    menu.classList.remove("is-open");
    menuButton.focus();
  }
});

function storedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  themeColor.content = theme === "dark" ? "#08101e" : "#f6f3ec";
}

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("theme", next);
  } catch {}
  applyTheme(next);
});
systemDark.addEventListener("change", (event) => {
  if (!storedTheme()) applyTheme(event.matches ? "dark" : "light");
});
applyTheme(root.dataset.theme === "dark" ? "dark" : "light");

const sectionLinks = [...menu.querySelectorAll('a[href^="#"]')];
const linkedSections = sectionLinks.map((link) => document.querySelector(link.hash));
let scrollQueued = false;

function updateScrollState() {
  scrollQueued = false;
  const scrollable = root.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0})`;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
  const marker = window.innerHeight * .35;
  let current = -1;
  linkedSections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= marker) current = index;
  });
  sectionLinks.forEach((link, index) => {
    link.classList.toggle("is-current", index === current);
    if (index === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function queueScrollState() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateScrollState);
}

window.addEventListener("scroll", queueScrollState, { passive: true });
window.addEventListener("resize", queueScrollState);

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: .06 });
  root.classList.add("reveal-ready");
  document.querySelectorAll("[data-reveal], [data-reveal-group] > *").forEach((item) => revealObserver.observe(item));
}

const stats = {
  opportunities: opportunities.length,
  open: filterOpportunities(opportunities, { category: "open" }).length,
  events: eventExamples.length,
  days: 90
};
document.querySelectorAll("[data-stat]").forEach((node) => {
  const target = stats[node.dataset.stat];
  node.textContent = target;
  if (reducedMotion.matches) return;
  const started = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - started) / 1100, 1);
    node.textContent = Math.round(target * (1 - (1 - progress) ** 3));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const ageDays = Math.floor((Date.now() - Date.parse(`${REVIEWED_ON}T00:00:00`)) / 86_400_000);
if (ageDays > 30) {
  const note = document.querySelector("#freshness-note");
  note.hidden = false;
  note.textContent = `This funding snapshot is ${ageDays} days old. Treat status labels as historical and confirm the current call on its official page.`;
}

updateList();
updateEventExamples();
updateRebateEstimate();
updateScrollState();

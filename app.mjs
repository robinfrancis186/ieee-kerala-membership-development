import { REVIEWED_ON, opportunities, estimateStudentBranchRebate, filterOpportunities } from "./opportunities.mjs";
import { eventExamples, filterEventExamples } from "./events.mjs";

const list = document.querySelector("#opportunity-list");
const search = document.querySelector("#funding-search");
const count = document.querySelector("#result-count");
const empty = document.querySelector("#empty-state");
const travelOnly = document.querySelector("#travel-only");
const catalogStatus = document.querySelector("#catalog-status");
const catalogHeading = document.querySelector("#catalog-heading");
const catalogResults = document.querySelector("#catalog-results");
const buttons = [...document.querySelectorAll("[data-filter]")];
const eventGrid = document.querySelector("#event-grid");
const eventCount = document.querySelector("#events-count");
const eventFilterButtons = [...document.querySelectorAll("[data-event-filter]")];
const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-nav");
let activeCategory = "all";
let catalogTimer;
let catalogRequest;
let lastCatalogEntries = [];
let activeEventCategory = "all";

const statusLabels = { open: "Open at last check", closed: "Closed in 2026", recurring: "Annual cycle", check: "Check next cycle" };

function renderOpportunity(item) {
  const status = item.status;
  const card = document.createElement("article");
  card.className = "opportunity-row";
  card.setAttribute("role", "listitem");
  card.innerHTML = `
    <div class="opp-primary">
      <h3 class="opp-title"></h3><p class="opp-type"></p>
    </div>
    <div><span class="opp-cell-label">Status</span><span class="opp-status status-${status}"></span></div>
    <div><span class="opp-cell-label">Amount</span><span class="opp-amount"></span></div>
    <div><span class="opp-cell-label">Opening, closing, cycle</span><span class="opp-window"></span></div>
    <div><span class="opp-cell-label">Best fit and eligibility</span><p class="opp-fit"></p><small class="opp-eligibility"></small></div>
    <a class="opp-source" target="_blank" rel="noopener noreferrer"><span></span><span aria-hidden="true">↗</span></a>`;
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

function renderEventExample(item) {
  const card = document.createElement("article");
  card.className = "event-card";
  card.setAttribute("role", "listitem");
  card.innerHTML = `<div class="event-card-top"><span class="event-format"></span><span class="event-edition"></span></div>
    <h3 class="event-title"></h3><p class="event-organizers"></p><p class="event-summary"></p>
    <div class="event-takeaway"><strong>Idea to borrow</strong><p></p></div>
    <a class="event-source" target="_blank" rel="noopener noreferrer"><span></span><span aria-hidden="true">↗</span></a>`;
  card.querySelector(".event-format").textContent = item.format;
  card.querySelector(".event-edition").textContent = item.edition;
  card.querySelector(".event-title").textContent = item.title;
  card.querySelector(".event-organizers").textContent = item.organizers;
  card.querySelector(".event-summary").textContent = item.summary;
  card.querySelector(".event-takeaway p").textContent = item.takeaway;
  const source = card.querySelector(".event-source");
  source.href = item.source;
  source.querySelector("span").textContent = item.sourceLabel;
  return card;
}

function updateEventExamples() {
  const filtered = filterEventExamples(eventExamples, activeEventCategory);
  eventGrid.replaceChildren(...filtered.map(renderEventExample));
  eventCount.textContent = `${filtered.length} of ${eventExamples.length} documented examples`;
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
  list.replaceChildren(...filtered.map(renderOpportunity));
  count.textContent = `${filtered.length} of ${opportunities.length} reviewed opportunities shown`;
  empty.hidden = filtered.length > 0;
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
const rebateResult = document.querySelector("#rebate-result");
const readiness = ["#plan-submitted", "#activities-reported", "#officers-current"].map((selector) => document.querySelector(selector));
const coreDues = document.querySelector("#core-dues");
const poolResult = document.querySelector("#pool-result");
const money = (amount) => `US$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function updateRebateEstimate() {
  if (branchMembers.value === "") {
    rebateResult.textContent = "Enter the prior-year member count to see a planning estimate.";
    return;
  }
  const countValue = Number(branchMembers.value);
  const estimate = estimateStudentBranchRebate(countValue);
  if (!Number.isInteger(countValue) || countValue > 100000) {
    rebateResult.textContent = "Enter a whole-number member count between 12 and 100,000.";
  } else if (estimate === null) {
    rebateResult.textContent = "The published Student Branch minimum is 12 Student or Graduate Student members. No rebate estimate is shown below that threshold.";
  } else if (readiness.every((checkbox) => checkbox.checked)) {
    rebateResult.textContent = `Formula-based estimate: ${money(estimate)}. The Section must confirm the branch's good standing and actual payment.`;
  } else {
    rebateResult.textContent = `Potential estimate if all reporting checks are complete: ${money(estimate)}. This is not a payable amount until the Section confirms eligibility.`;
  }
}

function updatePoolEstimate() {
  if (coreDues.value === "") {
    poolResult.textContent = "Add core dues to see the illustrative 12% MGA pool share.";
    return;
  }
  const dues = Number(coreDues.value);
  if (!Number.isFinite(dues) || dues < 0) {
    poolResult.textContent = "Enter a non-negative core IEEE dues amount.";
    return;
  }
  poolResult.textContent = `Illustrative 12% aggregate MGA allocation: ${money(dues * .12)}. This is not the amount paid to one Branch, Section, Council, or Region.`;
}

branchMembers.addEventListener("input", updateRebateEstimate);
readiness.forEach((checkbox) => checkbox.addEventListener("change", updateRebateEstimate));
coreDues.addEventListener("input", updatePoolEstimate);

buttons.forEach((button) => button.addEventListener("click", () => {
  activeCategory = button.dataset.filter;
  buttons.forEach((candidate) => {
    const active = candidate === button;
    candidate.classList.toggle("is-active", active);
    candidate.setAttribute("aria-pressed", String(active));
  });
  updateList();
}));
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

eventFilterButtons.forEach((button) => button.addEventListener("click", () => {
  activeEventCategory = button.dataset.eventFilter;
  eventFilterButtons.forEach((candidate) => {
    const active = candidate === button;
    candidate.classList.toggle("is-active", active);
    candidate.setAttribute("aria-pressed", String(active));
  });
  updateEventExamples();
}));

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

const ageDays = Math.floor((Date.now() - Date.parse(`${REVIEWED_ON}T00:00:00`)) / 86_400_000);
if (ageDays > 30) {
  const note = document.querySelector("#freshness-note");
  note.hidden = false;
  note.textContent = `This funding snapshot is ${ageDays} days old. Treat status labels as historical and confirm the current call on its official page.`;
}

updateList();
updateEventExamples();

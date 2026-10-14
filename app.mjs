import { REVIEWED_ON, opportunities, estimateStudentBranchRebate, filterOpportunities } from "./opportunities.mjs";
import { eventExamples, filterEventExamples } from "./events.mjs";
import { catalogue, filterCatalogue } from "./catalogue.mjs";
import { IEEE_DAY, ieeeDayOffers, filterOffers, ieeeDayStatus } from "./offers.mjs";
import { logoFor, abbreviationFor } from "./logos.mjs";

const root = document.documentElement;
const list = document.querySelector("#opportunity-list");
const search = document.querySelector("#funding-search");
const count = document.querySelector("#result-count");
const empty = document.querySelector("#empty-state");
const moreButton = document.querySelector("#show-more");
const travelOnly = document.querySelector("#travel-only");
const catalogueList = document.querySelector("#catalogue-list");
const catalogueCount = document.querySelector("#catalogue-count");
const catalogueEmpty = document.querySelector("#catalogue-empty");
const catalogueUnit = document.querySelector("#catalogue-unit");
const catalogueTypes = document.querySelector("#catalogue-types");
const moreCatalogueButton = document.querySelector("#show-more-catalogue");
const offerGrid = document.querySelector("#offer-grid");
const offersCount = document.querySelector("#offers-count");
const offerFilterButtons = [...document.querySelectorAll("[data-offer-filter]")];
const moreOffersButton = document.querySelector("#show-more-offers");
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
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const compact = window.matchMedia("(max-width: 680px)");
const previewCount = () => (compact.matches ? 4 : 9);
const eventPreviewCount = () => (compact.matches ? 4 : eventExamples.length);
const cataloguePreviewCount = () => (compact.matches ? 6 : 12);
const offerPreviewCount = () => (compact.matches ? 6 : ieeeDayOffers.length);
const tones = ["blue", "teal", "amber", "coral"];
let activeCategory = "all";
let showAll = false;
let showAllEvents = false;
let showAllCatalogue = false;
let activeCatalogueType = "all";
let activeOfferFilter = "all";
let showAllOffers = false;
let activeEventCategory = "all";

const statusLabels = { open: "Open at last check", closed: "Closed in 2026", recurring: "Annual cycle", check: "Check next cycle" };
const eventCategoryLabels = { "student-branch": "Student Branch", society: "Society chapter", "kerala-wide": "Kerala-wide" };
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

function logoTile(name, { small = false, fallback = true } = {}) {
  const logo = logoFor(name);
  if (!logo && !fallback) return null;
  const tile = document.createElement("span");
  tile.className = `logo-tile${small ? " is-small" : ""}${logo?.dark ? " is-dark" : ""}${logo ? "" : " is-mono"}`;
  if (logo) {
    const image = document.createElement("img");
    image.src = logo.src;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    tile.append(image);
  } else {
    tile.textContent = abbreviationFor(name);
    tile.setAttribute("aria-hidden", "true");
  }
  return tile;
}

function renderOpportunity(item, index) {
  const status = item.status;
  const card = document.createElement("article");
  card.className = "opportunity-card";
  card.setAttribute("role", "listitem");
  card.style.setProperty("--i", Math.min(index, 9));
  card.innerHTML = `
    <div class="opp-top"><div class="opp-chips"><span class="opp-status status-${status}"></span>${item.travel ? `<span class="opp-tag">Travel</span>` : ""}</div></div>
    <div class="opp-primary"><h3 class="opp-title"></h3><p class="opp-type"></p></div>
    <dl class="opp-facts">
      <div><dt>Amount</dt><dd class="opp-amount"></dd></div>
      <div><dt>Opening, closing, cycle</dt><dd class="opp-window"></dd></div>
    </dl>
    <div><span class="opp-label">Best fit and eligibility</span><p class="opp-fit"></p><small class="opp-eligibility"></small></div>
    <a class="opp-source" target="_blank" rel="noopener noreferrer"><span></span>${icon("arrow-up-right")}</a>`;
  card.querySelector(".opp-top").append(logoTile(item.organization));
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
    <h3 class="event-title"></h3><div class="event-org"><p class="event-organizers"></p></div><p class="event-summary"></p>
    <div class="event-takeaway"><strong>${icon("bulb")}Idea to borrow</strong><p></p></div>
    <div class="event-card-bottom"><div class="event-tags"></div><a class="event-source" target="_blank" rel="noopener noreferrer"><span></span>${icon("arrow-up-right")}</a></div>`;
  card.querySelector(".event-format").textContent = item.format;
  card.querySelector(".event-edition").textContent = item.edition;
  card.querySelector(".event-title").textContent = item.title;
  card.querySelector(".event-organizers").textContent = item.organizers;
  const organizerLogo = logoTile(item.organizers, { small: true, fallback: false });
  if (organizerLogo) card.querySelector(".event-org").prepend(organizerLogo);
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
}

function renderCatalogueRow(item) {
  const row = document.createElement("a");
  row.className = "catalogue-row";
  row.setAttribute("role", "listitem");
  row.href = item.link;
  row.target = "_blank";
  row.rel = "noopener noreferrer";
  row.innerHTML = `<span class="catalogue-text"><strong></strong><small></small></span>${icon("arrow-up-right")}`;
  row.prepend(logoTile(item.unit, { small: true }));
  row.querySelector("strong").textContent = item.title;
  row.querySelector("small").textContent = `${item.unit} · ${item.type}`;
  return row;
}

function updateCatalogue() {
  const filtered = filterCatalogue(catalogue, { type: activeCatalogueType, unit: catalogueUnit.value, query: search.value });
  const visible = showAllCatalogue ? filtered : filtered.slice(0, cataloguePreviewCount());
  catalogueList.replaceChildren(...visible.map(renderCatalogueRow));
  catalogueCount.textContent = visible.length < filtered.length
    ? `Showing ${visible.length} of ${filtered.length} ${filtered.length === catalogue.length ? "catalogue" : "matching"} listings`
    : `${filtered.length} of ${catalogue.length} catalogue listings shown`;
  catalogueEmpty.hidden = filtered.length > 0;
  moreCatalogueButton.hidden = filtered.length <= cataloguePreviewCount();
  moreCatalogueButton.textContent = showAllCatalogue ? "Show fewer" : `Show all ${filtered.length} listings`;
  moreCatalogueButton.setAttribute("aria-expanded", String(showAllCatalogue));
}

function renderOffer(offer, index) {
  const card = document.createElement("article");
  card.className = "offer-card";
  card.setAttribute("role", "listitem");
  card.style.setProperty("--i", Math.min(index, 9));
  card.innerHTML = `<div class="offer-head"><h3 class="offer-society"></h3></div><ul class="offer-deals"></ul>`;
  card.querySelector(".offer-head").prepend(logoTile(offer.society));
  card.querySelector(".offer-society").textContent = offer.society;
  card.querySelector(".offer-deals").append(...offer.deals.map((deal) => {
    const row = document.createElement("li");
    row.className = `offer-deal kind-${deal.kind}`;
    row.innerHTML = `<div><strong class="offer-headline"></strong><span class="offer-who"></span></div>
      <button class="promo-code" type="button"><code></code>${icon("copy")}${icon("check")}<span class="sr-only" aria-live="polite"></span></button>`;
    row.querySelector(".offer-headline").textContent = deal.headline;
    row.querySelector(".offer-who").textContent = deal.who;
    const button = row.querySelector(".promo-code");
    button.dataset.code = deal.code;
    button.setAttribute("aria-label", `Copy promo code ${deal.code}`);
    button.querySelector("code").textContent = deal.code;
    return row;
  }));
  if (offer.note) {
    const note = document.createElement("p");
    note.className = "offer-note";
    note.textContent = offer.note;
    card.append(note);
  }
  return card;
}

function updateOffers() {
  const filtered = filterOffers(ieeeDayOffers, activeOfferFilter);
  const visible = showAllOffers ? filtered : filtered.slice(0, offerPreviewCount());
  offerGrid.replaceChildren(...visible.map(renderOffer));
  offersCount.textContent = visible.length < filtered.length
    ? `Showing ${visible.length} of ${filtered.length} offers`
    : `${filtered.length} of ${ieeeDayOffers.length} offers`;
  moreOffersButton.hidden = filtered.length <= offerPreviewCount();
  moreOffersButton.textContent = showAllOffers ? "Show fewer" : `Show all ${filtered.length} offers`;
  moreOffersButton.setAttribute("aria-expanded", String(showAllOffers));
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
  updateList();
  updateCatalogue();
});
travelOnly.addEventListener("change", updateList);
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
  updateCatalogue();
  updateOffers();
});

const catalogueTypeNames = [...new Set(catalogue.map((item) => item.type))].sort();
catalogueTypes.append(...["all", ...catalogueTypeNames].map((type) => {
  const button = document.createElement("button");
  button.className = `filter-button${type === "all" ? " is-active" : ""}`;
  button.type = "button";
  button.dataset.catalogueType = type;
  button.setAttribute("aria-pressed", String(type === "all"));
  button.textContent = type === "all" ? "All types" : type;
  addFilterCount(button, filterCatalogue(catalogue, { type }).length);
  return button;
}));
catalogueUnit.append(...[...new Set(catalogue.map((item) => item.unit))].map((unit) => {
  const option = document.createElement("option");
  option.value = unit;
  option.textContent = `${unit} (${filterCatalogue(catalogue, { unit }).length})`;
  return option;
}));
document.querySelector("#catalogue-total").textContent = catalogue.length;
catalogueTypes.addEventListener("click", (event) => {
  const button = event.target.closest("[data-catalogue-type]");
  if (!button) return;
  activeCatalogueType = button.dataset.catalogueType;
  catalogueTypes.querySelectorAll("[data-catalogue-type]").forEach((candidate) => {
    const active = candidate === button;
    candidate.classList.toggle("is-active", active);
    candidate.setAttribute("aria-pressed", String(active));
  });
  updateCatalogue();
});
catalogueUnit.addEventListener("change", updateCatalogue);
moreCatalogueButton.addEventListener("click", () => {
  showAllCatalogue = !showAllCatalogue;
  updateCatalogue();
  if (!showAllCatalogue) document.querySelector("#catalogue").scrollIntoView({ block: "start" });
});

offerFilterButtons.forEach((button) => {
  addFilterCount(button, filterOffers(ieeeDayOffers, button.dataset.offerFilter).length);
  button.addEventListener("click", () => {
    activeOfferFilter = button.dataset.offerFilter;
    offerFilterButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    updateOffers();
  });
});
moreOffersButton.addEventListener("click", () => {
  showAllOffers = !showAllOffers;
  updateOffers();
  if (!showAllOffers) document.querySelector("#ieee-day .events-tools").scrollIntoView({ block: "start" });
});
offerGrid.addEventListener("click", async (event) => {
  const button = event.target.closest(".promo-code");
  if (!button) return;
  try {
    await navigator.clipboard.writeText(button.dataset.code);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(button.querySelector("code"));
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    return;
  }
  button.classList.add("is-copied");
  button.querySelector(".sr-only").textContent = "Copied";
  setTimeout(() => {
    button.classList.remove("is-copied");
    button.querySelector(".sr-only").textContent = "";
  }, 1600);
});

const offerStatus = ieeeDayStatus();
const offerSection = document.querySelector("#ieee-day");
const dayCount = `${offerStatus.daysLeft} day${offerStatus.daysLeft === 1 ? "" : "s"} left`;
offerSection.dataset.state = offerStatus.state;
document.querySelector("#offer-window-detail").textContent = {
  upcoming: "Codes start working when the offer window opens.",
  active: `${dayCount} to use these codes.`,
  ended: "This offer window has closed. The codes are kept here for reference and may no longer work."
}[offerStatus.state];
if (offerStatus.state === "active") {
  document.querySelector("#announce-text").textContent = `IEEE Day ${IEEE_DAY.year}: ${ieeeDayOffers.length} Society membership offers, ${dayCount}`;
  document.querySelector("#announce").hidden = false;
}

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
  menuButton.querySelector(".sr-only").textContent = expanded ? "Open chapter list" : "Close chapter list";
  menu.classList.toggle("is-open", !expanded);
});
menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.querySelector(".sr-only").textContent = "Open chapter list";
    menu.classList.remove("is-open");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.querySelector(".sr-only").textContent = "Open chapter list";
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
  themeColor.content = theme === "dark" ? "#0b1118" : "#ffffff";
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

const chapterLinks = [...document.querySelectorAll(".chapter-link")];
const chapterSections = [...new Set(chapterLinks.map((link) => link.hash))].map((hash) => document.querySelector(hash)).filter(Boolean);
let scrollQueued = false;

function updateScrollState() {
  scrollQueued = false;
  const scrollable = root.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0})`;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
  const marker = window.innerHeight * .3;
  let current = null;
  chapterSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= marker) current = `#${section.id}`;
  });
  chapterLinks.forEach((link) => {
    const active = link.hash === current;
    link.classList.toggle("is-current", active);
    if (active) link.setAttribute("aria-current", "location");
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

const stats = {
  opportunities: opportunities.length,
  catalogue: catalogue.length,
  offers: ieeeDayOffers.length,
  events: eventExamples.length
};
document.querySelectorAll("[data-stat]").forEach((node) => {
  node.textContent = stats[node.dataset.stat];
});

const ageDays = Math.floor((Date.now() - Date.parse(`${REVIEWED_ON}T00:00:00`)) / 86_400_000);
if (ageDays > 30) {
  const note = document.querySelector("#freshness-note");
  note.hidden = false;
  note.textContent = `This funding snapshot is ${ageDays} days old. Treat status labels as historical and confirm the current call on its official page.`;
}

updateList();
updateEventExamples();
updateCatalogue();
updateOffers();
updateRebateEstimate();
updateScrollState();

import test from "node:test";
import assert from "node:assert/strict";
import { estimateStudentBranchRebate, filterOpportunities, opportunities } from "../opportunities.mjs";

test("funding filters separate open, recurring, closed, and cycle-check items", () => {
  assert.equal(filterOpportunities(opportunities, { category: "open" }).length, 14);
  assert.ok(filterOpportunities(opportunities, { category: "recurring" }).every((item) => item.recurring));
  assert.ok(filterOpportunities(opportunities, { category: "closed" }).every((item) => item.status === "closed"));
  assert.ok(filterOpportunities(opportunities, { category: "check" }).every((item) => item.status === "check"));
});

test("search matches amount, eligibility, and titles after trimming case", () => {
  assert.ok(filterOpportunities(opportunities, { query: "  US$2,500  " }).some((item) => item.id === "wie-international"));
  assert.ok(filterOpportunities(opportunities, { query: "community partner" }).some((item) => item.id === "epics"));
  assert.ok(filterOpportunities(opportunities, { query: "women" }).some((item) => item.id === "wie-travel"));
  assert.equal(filterOpportunities(opportunities, { query: "comsoc" }).length, 6);
  assert.equal(filterOpportunities(opportunities, { query: "not a real opportunity" }).length, 0);
});

test("travel-only returns only marked travel opportunities", () => {
  const results = filterOpportunities(opportunities, { travelOnly: true, query: "IEEE" });
  assert.ok(results.length > 0);
  assert.ok(results.every((item) => item.travel));
});

test("branch rebate estimate honors the 12-member floor and 50-member tier", () => {
  assert.equal(estimateStudentBranchRebate(11), null);
  assert.equal(estimateStudentBranchRebate(12), 74);
  assert.equal(estimateStudentBranchRebate(49), 148);
  assert.equal(estimateStudentBranchRebate(50), 200);
  assert.equal(estimateStudentBranchRebate(50.5), null);
  assert.equal(estimateStudentBranchRebate(100001), null);
  assert.equal(estimateStudentBranchRebate(Infinity), null);
});

test("every funding record has a safe source and searchable organization metadata", () => {
  assert.ok(opportunities.length >= 25);
  assert.ok(opportunities.every((item) => item.organization && typeof item.travel === "boolean" && new URL(item.source).protocol === "https:"));
});

test("new Society records distinguish open calls, rolling grants, and closed cycles", () => {
  assert.equal(opportunities.find((item) => item.id === "emc-hardware-competition-2027").status, "open");
  assert.equal(opportunities.find((item) => item.id === "hkn-chapter-support").status, "open");
  assert.equal(opportunities.find((item) => item.id === "tems-sbc-spark-2026").status, "check");
  assert.equal(opportunities.find((item) => item.id === "comsoc-stlc-2026").status, "closed");
  assert.ok(filterOpportunities(opportunities, { travelOnly: true, query: "ITSS" }).some((item) => item.id === "itss-flagship-travel"));
  assert.ok(filterOpportunities(opportunities, { query: "student branch chapter activity" }).some((item) => item.id === "eps-student-chapter-subsidy"));
});

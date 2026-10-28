import assert from "node:assert/strict";
import test from "node:test";
import { getMemberContent, servicePlanDayLabel } from "../js/public-content.js";

function installStorage() {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    }
  };
  values.set("cerc-public-programs-v5", "null");
  values.set("cerc-public-service-plans-v2", "null");
  return values;
}

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; }
  };
}

test("labels a service on the local current date as Today's Service", () => {
  const today = new Date(2026, 9, 12, 12, 0, 0);
  assert.equal(servicePlanDayLabel("2026-10-12", today, "en-US"), "Today’s Service");
});

test("shows a weekday for other valid service dates and rejects invalid dates", () => {
  const today = new Date(2026, 9, 12, 12, 0, 0);
  assert.equal(servicePlanDayLabel("2026-10-11", today, "en-US"), "Sunday, Oct 11, 2026");
  assert.equal(servicePlanDayLabel("2026-02-30", today, "en-US"), "");
  assert.equal(servicePlanDayLabel("not-a-date", today, "en-US"), "");
});

test("loads past and future public programs and service plans through read-only requests", async () => {
  installStorage();
  const requests = [];
  globalThis.fetch = async function (url, options) {
    requests.push({ url: new URL(String(url)), options });
    if (String(url).includes("/programs?")) {
      return response([
        { id: "event-1", title: "Annual Meeting", category: "Bible Study", minister: "Minister Grace", description: "A community gathering.", venue: "Church Hall", start_date: "2026-10-20", end_date: null, flyer_data_url: "", created_at: "2026-10-12T10:00:00Z", response_question: "Will you attend?", yes_label: "Yes", no_label: "No" },
        { id: "event-past", title: "Past Meeting", description: "", venue: "Church Hall", start_date: "2026-10-01", end_date: null, flyer_data_url: "", created_at: "2026-10-01T10:00:00Z", response_question: "Will you attend?", yes_label: "Yes", no_label: "No" }
      ]);
    }
    return response([
      { id: "plan-1", title: "Sunday Worship", date: "2026-10-11", hymn_ids: ["hymn-1"] },
      { id: "plan-past", title: "Past Service", date: "2026-10-01", hymn_ids: ["hymn-2"] }
    ]);
  };

  const content = await getMemberContent();

  assert.deepEqual(content.programs.map(function (item) { return item.id; }), ["event-1", "event-past"]);
  assert.deepEqual(content.servicePlans.map(function (item) { return item.id; }), ["plan-1", "plan-past"]);
  assert.equal(content.programsAvailable, true);
  assert.equal(content.servicePlansAvailable, true);
  assert.equal(requests.length, 2);
  const programsRequest = requests.find(function (request) { return request.url.pathname.endsWith("/programs"); });
  const plansRequest = requests.find(function (request) { return request.url.pathname.endsWith("/service_plans"); });
  assert.equal(programsRequest.options.method, "GET");
  assert.match(programsRequest.url.searchParams.get("select"), /flyer_data_url/);
  assert.match(programsRequest.url.searchParams.get("select"), /minister/);
  assert.match(programsRequest.url.searchParams.get("select"), /category/);
  assert.equal(content.programs[0].category, "Bible Study");
  assert.equal(content.programs[0].minister, "Minister Grace");
  assert.match(programsRequest.url.searchParams.get("select"), /created_at/);
  assert.match(programsRequest.url.searchParams.get("select"), /description/);
  assert.match(programsRequest.url.searchParams.get("select"), /response_question/);
  assert.equal(programsRequest.url.searchParams.get("or"), null);
  assert.equal(programsRequest.url.searchParams.get("order"), "created_at.desc");
  assert.equal(plansRequest.url.searchParams.get("date"), null);
  assert.equal(plansRequest.url.searchParams.get("order"), "date.desc");
  assert.match(plansRequest.url.searchParams.get("select"), /hymn_ids/);
});

test("falls back through older public programme fields when response metadata is not granted", async () => {
  installStorage();
  const requests = [];
  globalThis.fetch = async function (url) {
    const parsed = new URL(String(url));
    requests.push(parsed);
    if (parsed.pathname.endsWith("/programs")) {
      if (parsed.searchParams.get("select").includes("created_at")) {
        return response({ message: "permission denied for table programs" }, 401);
      }
      return response([
        { id: "event-1", title: "Annual Meeting", venue: "Church Hall", start_date: "2026-10-20", end_date: null, flyer_data_url: "" }
      ]);
    }
    return response([]);
  };

  const content = await getMemberContent();
  const programRequests = requests.filter(function (request) { return request.pathname.endsWith("/programs"); });

  assert.deepEqual(content.programs.map(function (item) { return item.id; }), ["event-1"]);
  assert.equal(content.programsAvailable, true);
  assert.equal(content.usingCache, false);
  assert.equal(programRequests.length, 5);
  assert.match(programRequests[0].searchParams.get("select"), /minister/);
  assert.match(programRequests[0].searchParams.get("select"), /category/);
  assert.match(programRequests[0].searchParams.get("select"), /created_at/);
  assert.match(programRequests[1].searchParams.get("select"), /minister/);
  assert.doesNotMatch(programRequests[1].searchParams.get("select"), /category/);
  assert.match(programRequests[1].searchParams.get("select"), /created_at/);
  assert.doesNotMatch(programRequests[2].searchParams.get("select"), /minister|category/);
  assert.match(programRequests[2].searchParams.get("select"), /created_at/);
  assert.match(programRequests[3].searchParams.get("select"), /created_at/);
  assert.doesNotMatch(programRequests[4].searchParams.get("select"), /created_at/);
  assert.equal(programRequests[4].searchParams.get("order"), "start_date.desc");
});

test("uses cached public content when the public database is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-public-programs-v5", JSON.stringify([
    { id: "event-1", title: "Upcoming Event", venue: "Church Hall", start_date: "2026-10-20", end_date: null }
  ]));
  globalThis.fetch = async function () { return response({ message: "public read is not enabled" }, 403); };

  const content = await getMemberContent();

  assert.deepEqual(content.programs.map(function (item) { return item.id; }), ["event-1"]);
  assert.equal(content.programsAvailable, false);
  assert.equal(content.usingCache, true);
  assert.deepEqual(content.servicePlans, []);
});

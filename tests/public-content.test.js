import assert from "node:assert/strict";
import test from "node:test";
import { getMemberContent } from "../js/public-content.js";

function installStorage() {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    }
  };
  values.set("cerc-public-programs-v2", "null");
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

test("loads past and future public programs and service plans through read-only requests", async () => {
  installStorage();
  const requests = [];
  globalThis.fetch = async function (url, options) {
    requests.push({ url: new URL(String(url)), options });
    if (String(url).includes("/programs?")) {
      return response([
        { id: "event-1", title: "Annual Meeting", venue: "Church Hall", start_date: "2026-10-20", end_date: null, flyer_data_url: "" },
        { id: "event-past", title: "Past Meeting", venue: "Church Hall", start_date: "2026-10-01", end_date: null, flyer_data_url: "" }
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
  assert.equal(programsRequest.url.searchParams.get("or"), null);
  assert.equal(programsRequest.url.searchParams.get("order"), "start_date.desc");
  assert.equal(plansRequest.url.searchParams.get("date"), null);
  assert.equal(plansRequest.url.searchParams.get("order"), "date.desc");
  assert.match(plansRequest.url.searchParams.get("select"), /hymn_ids/);
});

test("uses cached public content when the public database is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-public-programs-v2", JSON.stringify([
    { id: "event-1", title: "Upcoming Event", venue: "Church Hall", start_date: "2026-10-20", end_date: null }
  ]));
  globalThis.fetch = async function () { return response({ message: "public read is not enabled" }, 403); };

  const content = await getMemberContent();

  assert.deepEqual(content.programs.map(function (item) { return item.id; }), ["event-1"]);
  assert.equal(content.programsAvailable, false);
  assert.equal(content.usingCache, true);
  assert.deepEqual(content.servicePlans, []);
});

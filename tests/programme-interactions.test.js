import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import {
  castProgrammeVote,
  getProgrammeInteractions,
  postProgrammeComment
} from "../js/programme-interactions.js";

const programId = "b00b0000-0000-4000-8000-000000000001";
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete globalThis.window;
});

function installStorage() {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    }
  };
  return values;
}

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return payload; }
  };
}

test("loads anonymous vote totals and public comments through the read-only interaction RPC", async () => {
  installStorage();
  let request;
  globalThis.fetch = async function (url, options) {
    request = { url: String(url), options };
    return response([{
      program_id: programId,
      like_count: 4,
      liked: true,
      vote_yes_count: 4,
      vote_no_count: 2,
      my_vote: "yes",
      comment_count: 1,
      comments: [{ id: "c00b0000-0000-4000-8000-000000000002", body: "Amen", created_at: "2026-10-13T12:00:00Z" }]
    }]);
  };

  const result = await getProgrammeInteractions([{ id: programId }]);

  assert.equal(request.url.endsWith("/rest/v1/rpc/get_programme_interactions"), true);
  assert.equal(request.options.method, "POST");
  const body = JSON.parse(request.options.body);
  assert.deepEqual(body.p_program_ids, [programId]);
  assert.match(body.p_visitor_id, /^[0-9a-f-]{36}$/i);
  assert.equal(result.available, true);
  assert.equal(result.votesAvailable, true);
  assert.equal(result.byProgram[programId].voteYesCount, 4);
  assert.equal(result.byProgram[programId].voteNoCount, 2);
  assert.equal(result.byProgram[programId].myVote, "yes");
  assert.equal(result.byProgram[programId].commentCount, 1);
  assert.equal(result.byProgram[programId].comments[0].id, "c00b0000-0000-4000-8000-000000000002");
});

test("casts an anonymous Yes/No vote without sending a name", async () => {
  installStorage();
  let request;
  globalThis.fetch = async function (url, options) {
    request = { url: String(url), options };
    return response({ my_vote: "no", vote_yes_count: 2, vote_no_count: 3 });
  };

  const result = await castProgrammeVote(programId, "no");
  const body = JSON.parse(request.options.body);

  assert.equal(request.url.endsWith("/rest/v1/rpc/cast_programme_vote"), true);
  assert.equal(body.p_program_id, programId);
  assert.equal(body.p_choice, "no");
  assert.match(body.p_visitor_id, /^[0-9a-f-]{36}$/i);
  assert.equal("name" in body, false);
  assert.deepEqual(result, { myVote: "no", voteYesCount: 2, voteNoCount: 3 });
});

test("rejects invalid programme vote choices before making a request", async () => {
  installStorage();
  let called = false;
  globalThis.fetch = async function () {
    called = true;
    return response({});
  };

  await assert.rejects(castProgrammeVote(programId, "maybe"), /Choose one/);
  assert.equal(called, false);
});

test("posts comments anonymously and uses the returned comment ID", async () => {
  installStorage();
  let request;
  globalThis.fetch = async function (url, options) {
    request = { url: String(url), options };
    return response({
      id: "c00b0000-0000-4000-8000-000000000002",
      body: "Amen",
      created_at: "2026-10-13T12:00:00Z"
    });
  };

  const comment = await postProgrammeComment(programId, "  Amen  ");
  const body = JSON.parse(request.options.body);

  assert.equal(request.url.endsWith("/rest/v1/rpc/submit_programme_comment"), true);
  assert.equal(body.p_program_id, programId);
  assert.equal(body.p_body, "Amen");
  assert.equal("name" in body, false);
  assert.equal("author" in body, false);
  assert.equal(comment.id, "c00b0000-0000-4000-8000-000000000002");
});

test("rejects empty comments before making a request", async () => {
  installStorage();
  let called = false;
  globalThis.fetch = async function () {
    called = true;
    return response({});
  };

  await assert.rejects(postProgrammeComment(programId, "   "), /Write a comment/);
  assert.equal(called, false);
});

test("keeps anonymous interaction tables private and rate-limits repeated comments per browser", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/202610130004_programme_interactions.sql", import.meta.url),
    "utf8"
  );
  const voteMigration = readFileSync(
    new URL("../supabase/migrations/202610140001_public_programme_votes_and_descriptions.sql", import.meta.url),
    "utf8"
  );

  assert.match(migration, /alter table public\.programme_likes enable row level security/i);
  assert.match(migration, /alter table public\.programme_comments enable row level security/i);
  assert.match(migration, /revoke all on public\.programme_likes, public\.programme_comments from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.get_programme_interactions/);
  assert.match(migration, /grant execute on function public\.toggle_programme_like/);
  assert.match(migration, /grant execute on function public\.submit_programme_comment/);
  assert.match(migration, /pg_advisory_xact_lock\(hashtext\(p_visitor_id::text\)::bigint\)/);
  assert.match(migration, /created_at > clock_timestamp\(\) - interval '20 seconds'/);
  assert.match(migration, /char_length\(v_body\) not between 1 and 500/);
  assert.match(voteMigration, /alter table public\.programme_votes enable row level security/i);
  assert.match(voteMigration, /primary key \(program_id, visitor_id\)/i);
  assert.match(voteMigration, /grant execute on function public\.cast_programme_vote/);
  assert.match(voteMigration, /revoke all on public\.programme_votes from public, anon, authenticated/i);
  assert.match(voteMigration, /add column if not exists description text not null default ''/i);
});

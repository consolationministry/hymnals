import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  addLiveAudioComment,
  deleteLiveAudioProgram,
  getLiveAudioData,
  liveAudioCounts,
  liveAudioReactionSelected,
  recordLiveAudioListen,
  saveLiveAudioCategories,
  saveLiveAudioProgram,
  setLiveAudioProgramOnAir,
  setLiveAudioProgramStatus,
  toggleLiveAudioReaction
} from "../js/live-audio-data.js";
import { renderLiveAudioListener, renderLiveAudioPage } from "../js/live-audio-views.js";

const originalWindow = globalThis.window;

afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
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

test("audio programme changes stay in browser storage and publish to the member library", () => {
  const values = installStorage();
  const draft = saveLiveAudioProgram({
    title: "Sunday Service",
    speaker: "Pastor A",
    category: "Sunday Service",
    streamUrl: "https://audio.example.org/live"
  });
  assert.equal(draft.status, "draft");
  assert.equal(getLiveAudioData().programs.length, 1);
  assert.ok(values.size > 0);

  setLiveAudioProgramStatus(draft.id, "published");
  setLiveAudioProgramOnAir(draft.id, true);
  assert.equal(getLiveAudioData().programs[0].onAir, true);
});

test("programme data rejects unsafe media URLs and requires a stream before setting on air", () => {
  installStorage();
  const draft = saveLiveAudioProgram({
    title: "Bible Study",
    category: "Bible Study",
    imageUrl: "javascript:alert(1)",
    streamUrl: "http://audio.example.org/live"
  });
  assert.equal(draft.imageUrl, "");
  assert.equal(draft.streamUrl, "");
  setLiveAudioProgramStatus(draft.id, "published");
  assert.throws(() => setLiveAudioProgramOnAir(draft.id, true), /secure stream URL/);
  assert.equal(getLiveAudioData().programs[0].onAir, false);
});

test("listener reactions toggle per browser, comments are validated, and starts are counted locally", () => {
  installStorage();
  const program = saveLiveAudioProgram({ title: "Prayer Meeting", category: "Prayer Meeting", status: "published" });
  setLiveAudioProgramStatus(program.id, "published");
  toggleLiveAudioReaction(program.id, "love");
  let data = getLiveAudioData();
  assert.equal(liveAudioCounts(data, program.id).love, 1);
  assert.equal(liveAudioReactionSelected(data, program.id, "love"), true);
  toggleLiveAudioReaction(program.id, "love");
  data = getLiveAudioData();
  assert.equal(liveAudioCounts(data, program.id).love, 0);
  assert.equal(liveAudioReactionSelected(data, program.id, "love"), false);

  assert.throws(() => addLiveAudioComment(program.id, "  "), /Write a comment/);
  addLiveAudioComment(program.id, "Amen.");
  data = recordLiveAudioListen(program.id);
  assert.equal(data.comments[0].body, "Amen.");
  assert.equal(data.programs[0].listenCount, 1);
  assert.match(renderLiveAudioListener(data, program.id), /Amen\./);
  assert.match(renderLiveAudioListener(data, program.id), /shared with other listeners/);
});

test("category settings are normalized and deleting a programme removes its local interactions", () => {
  installStorage();
  saveLiveAudioCategories(["Bible Study", "  Bible Study  ", "Youth Service"]);
  assert.deepEqual(getLiveAudioData().categories, ["Bible Study", "Youth Service"]);
  const program = saveLiveAudioProgram({ title: "Youth Night", category: "Youth Service", status: "published" });
  setLiveAudioProgramStatus(program.id, "published");
  addLiveAudioComment(program.id, "Welcome.");
  deleteLiveAudioProgram(program.id);
  const data = getLiveAudioData();
  assert.equal(data.programs.length, 0);
  assert.equal(data.comments.length, 0);
});

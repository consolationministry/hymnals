import test from "node:test";
import assert from "node:assert/strict";
import {
  GROQ_CHAT_COMPLETIONS_URL,
  GROQ_HYMN_MODEL,
  GROQ_MODELS_URL,
  requestGroqHymnEdit,
  validateGroqApiKey
} from "../admin/js/groq-hymn-editor.js";

const original = {
  title_en: "Old title", title_yoruba: "Orin", first_line_en: "First line", first_line_yoruba: "Ìlà",
  verses_en: ["Verse one", "Verse two"], verses_yoruba: ["Ẹsẹ̀ kan"], chorus_en: "Chorus", chorus_yoruba: "Ìdáhùn"
};
const edited = {
  title_en: "A New Title", title_yoruba: "Orin", first_line_en: "A clearer opening", first_line_yoruba: "Ìlà",
  verses_en: ["Revised verse one", "Revised verse two"], verses_yoruba: ["Ẹsẹ̀ kan"], chorus_en: "Revised chorus", chorus_yoruba: "Ìdáhùn"
};

function jsonResponse(payload, ok = true, status = 200) {
  return { ok, status, json: async () => payload };
}

test("requests a schema-constrained Groq edit and returns editable hymn fields", async () => {
  let request;
  const result = await requestGroqHymnEdit({
    apiKey: "gsk-test", prompt: "Make the English clearer", hymn: original,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return jsonResponse({ choices: [{ message: { content: JSON.stringify(edited) } }] });
    }
  });
  assert.equal(request.url, GROQ_CHAT_COMPLETIONS_URL);
  assert.equal(request.options.headers.Authorization, "Bearer gsk-test");
  const body = JSON.parse(request.options.body);
  assert.equal(body.model, GROQ_HYMN_MODEL);
  assert.equal(body.response_format.json_schema.strict, true);
  assert.deepEqual(result, edited);
});

test("preserves original field values if a response omits optional output", async () => {
  const partial = { title_en: "Changed title", verses_en: ["One revised verse"] };
  const result = await requestGroqHymnEdit({
    apiKey: "key", prompt: "Only update the title", hymn: original,
    fetchImpl: async () => jsonResponse({ choices: [{ message: { content: JSON.stringify(partial) } }] })
  });
  assert.equal(result.title_en, "Changed title");
  assert.deepEqual(result.verses_en, ["One revised verse"]);
  assert.equal(result.chorus_en, original.chorus_en);
  assert.deepEqual(result.verses_yoruba, original.verses_yoruba);
});

test("reports a rejected API key without exposing it", async () => {
  await assert.rejects(
    requestGroqHymnEdit({ apiKey: "secret-test-value", prompt: "Edit", hymn: original, fetchImpl: async () => jsonResponse({ error: { message: "invalid" } }, false, 401) }),
    /Groq rejected this API key/
  );
});

test("validates a Groq key through the models endpoint", async () => {
  let calledUrl = "";
  const ok = await validateGroqApiKey("gsk-test", async (url) => { calledUrl = url; return jsonResponse({ data: [] }); });
  assert.equal(ok, true);
  assert.equal(calledUrl, GROQ_MODELS_URL);
});

test("rejects missing prompts before making a network request", async () => {
  let called = false;
  await assert.rejects(requestGroqHymnEdit({ apiKey: "gsk-test", prompt: " ", hymn: original, fetchImpl: async () => { called = true; } }), /Describe how you want/);
  assert.equal(called, false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { isManagedHymnSource, UPLOADED_HYMN_SOURCE, UPLOADED_YORUBA_HYMN_SOURCE } from "../js/hymnal-selection.js";

test("one unified hymn list: both managed sources are accepted, others are not", () => {
  assert.equal(isManagedHymnSource(UPLOADED_HYMN_SOURCE), true);
  assert.equal(isManagedHymnSource(UPLOADED_YORUBA_HYMN_SOURCE), true);
  assert.equal(isManagedHymnSource("Other"), false);
});

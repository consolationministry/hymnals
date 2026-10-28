import { supabaseRequest } from "./supabase-client.js?v=33";

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function cloudinaryRequest(action, values) {
  return supabaseRequest("functions/v1/cloudinary-live-audio", {
    method: "POST",
    body: Object.assign({ action }, values || {})
  });
}

export async function getCloudinarySettings() {
  return cloudinaryRequest("get-config");
}

export async function saveCloudinarySettings(values) {
  const cloudName = String(values && values.cloudName || "").trim();
  const apiKey = String(values && values.apiKey || "").trim();
  const apiSecret = String(values && values.apiSecret || "").trim();
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(cloudName)) {
    throw new Error("Enter a valid Cloudinary cloud name.");
  }
  if (Boolean(apiKey) !== Boolean(apiSecret)) {
    throw new Error("Enter both the Cloudinary API key and API secret to replace the saved credentials.");
  }
  const result = await cloudinaryRequest("save-config", { cloudName, apiKey, apiSecret });
  if (!result || result.configured !== true || result.cloudName !== cloudName) {
    throw new Error("Supabase did not confirm that the Cloudinary settings were stored.");
  }
  return result;
}

export async function removeCloudinarySettings() {
  return cloudinaryRequest("remove-config");
}

export function renderCloudinarySettingsPanel(config) {
  const settings = config || {};
  const configured = settings.configured === true;
  const available = settings.available !== false;
  const initialStatus = configured
    ? "Connected to Cloudinary · " + escapeHtml(settings.cloudName || "")
    : available
      ? "Not configured. Add the Cloudinary account details to enable audio uploads."
      : "Cloudinary setup is not deployed yet. Apply the migration and deploy its Edge Function.";
  const secretHint = configured
    ? "Leave the API key and secret blank to keep the current credentials. They are never returned to this page."
    : "The API secret is stored in a service-role-only Supabase table and never returned to the browser.";
  return '<section class="panel settings-module cloudinary-settings">' +
    '<header class="panel-header"><div><h2>Cloudinary audio storage</h2><p>Store live rewind segments and completed broadcast recordings in Cloudinary.</p></div></header>' +
    '<div class="panel-body"><form id="cloudinary-settings-form" novalidate>' +
    '<div class="admin-field"><label for="cloudinary-cloud-name">Cloud name</label><input class="form-input" id="cloudinary-cloud-name" name="cloudName" type="text" maxlength="64" autocomplete="off" value="' + escapeHtml(settings.cloudName || "") + '" required><p class="field-hint">Find this in your Cloudinary dashboard.</p></div>' +
    '<div class="admin-field"><label for="cloudinary-api-key">API key</label><input class="form-input" id="cloudinary-api-key" name="apiKey" type="password" autocomplete="new-password" spellcheck="false" placeholder="' + (configured ? "Leave blank to keep the saved key" : "Cloudinary API key") + '"></div>' +
    '<div class="admin-field"><label for="cloudinary-api-secret">API secret</label><input class="form-input" id="cloudinary-api-secret" name="apiSecret" type="password" autocomplete="new-password" spellcheck="false" placeholder="' + (configured ? "Leave blank to keep the saved secret" : "Cloudinary API secret") + '"><p class="field-hint">' + secretHint + '</p></div>' +
    '<div id="cloudinary-settings-status" class="cloudinary-status" role="status" aria-live="polite">' + initialStatus + '</div>' +
    '<div class="form-actions"><div class="form-actions-left">' +
    (configured ? '<button class="button button-secondary" type="button" data-action="remove-cloudinary-settings">Disconnect Cloudinary</button>' : "") +
    '</div><div class="form-actions-right"><button class="button button-primary" type="submit"' + (available ? "" : " disabled") + '>Save Cloudinary settings</button></div></div>' +
    '</form></div></section>';
}

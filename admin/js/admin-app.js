import { ADMIN_AUTH_CONFIGURED, initializeAdminAuth, loginAdmin, logoutAdmin } from "./admin-auth.js?v=31";
import { createCategory, createHymn, createProgram, createService, deleteCategory, deleteHymn, deleteProgram, deleteService, getAdminSettings, getCategories, getDailyQuoteSettings, getDashboardStats, getDraftHymns, getHymn, getHymns, getProgram, getPrograms, getPublishedHymns, getRecentlyUpdatedHymns, getServicePlan, getServicePlans, getStorageMode, initializeAdminData, publishHymn, saveHymnAsDraft, updateAdminSettings, updateCategory, updateDailyQuoteSettings, updateHymn, updateProgram, updateService } from "./admin-data.js?v=31";

const root = document.getElementById("admin-root");
const state = { view: "login", activeView: "dashboard", menuOpen: false, authStatus: null, hymnMode: "list", editingHymnId: null, search: "", statusFilter: "", categoryFilter: "", formStart: null, categoryMode: "list", editingCategoryName: null, categoryFormStart: null, serviceMode: "list", editingServiceId: null, serviceFormStart: null, programMode: "list", editingProgramId: null, programFlyerUrl: "", programFormStart: null, settingsFormStart: null, quoteSettingsFormStart: null, toastTimer: null };
const navigation = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "hymns", label: "Hymns", icon: "book" },
  { id: "categories", label: "Categories", icon: "layers" },
  { id: "services", label: "Service Planner", icon: "calendar" },
  { id: "programs", label: "Upcoming Programs", icon: "calendar" },
  { id: "settings", label: "Settings", icon: "settings" }
];
const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
  edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/>'
};

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
  });
}
function icon(name, extraClass) {
  const span = document.createElement("span");
  span.className = extraClass || "nav-icon";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + (iconPaths[name] || "") + "</svg>";
  return span;
}
function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function escapeLines(lines) {
  return (lines || []).map(function (line) { return "<p>" + escapeHtml(line) + "</p>"; }).join("");
}
function sanitizeRichHtml(input) {
  const parsed = new DOMParser().parseFromString(String(input || ""), "text/html");
  const allowed = new Set(["P", "DIV", "BR", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI", "BLOCKQUOTE", "SPAN", "FONT"]);
  const blocked = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "FORM", "INPUT", "VIDEO", "AUDIO"]);
  const fontFamilies = { "Arial": "Arial", "Georgia": "Georgia", "Tahoma": "Tahoma", "Verdana": "Verdana", "Times New Roman": "Times New Roman", "system-ui": "system-ui", "serif": "serif", "sans-serif": "sans-serif" };
  function clean(parent) {
    Array.from(parent.childNodes).forEach(function (node) {
      if (node.nodeType !== 1) return;
      const tag = node.tagName;
      if (blocked.has(tag)) { node.remove(); return; }
      if (!allowed.has(tag)) {
        clean(node);
        const replacement = parsed.createDocumentFragment();
        while (node.firstChild) replacement.appendChild(node.firstChild);
        node.replaceWith(replacement);
        return;
      }
      const oldStyle = node.style;
      const alignment = ["left", "center", "right", "justify"].indexOf(oldStyle.textAlign) >= 0 ? oldStyle.textAlign : "";
      const familyInput = oldStyle.fontFamily || node.getAttribute("face") || "";
      const family = Object.keys(fontFamilies).find(function (key) { return familyInput.toLowerCase().indexOf(key.toLowerCase()) >= 0; });
      const sizeInput = oldStyle.fontSize || "";
      const size = /^(12|14|16|18|20|24|28)px$/.test(sizeInput) ? sizeInput : "";
      const fontSizeAttr = /^[1-7]$/.test(node.getAttribute("size") || "") ? node.getAttribute("size") : "";
      Array.from(node.attributes).forEach(function (attribute) { node.removeAttribute(attribute.name); });
      if (alignment && (tag === "P" || tag === "DIV")) node.style.textAlign = alignment;
      if (family && (tag === "SPAN" || tag === "FONT")) node.style.fontFamily = fontFamilies[family];
      if (size && (tag === "SPAN" || tag === "FONT")) node.style.fontSize = size;
      if (tag === "FONT" && fontSizeAttr) node.setAttribute("size", fontSizeAttr);
      clean(node);
    });
  }
  clean(parsed.body);
  return parsed.body.innerHTML;
}
function plainTextFromHtml(html) {
  const parsed = new DOMParser().parseFromString(sanitizeRichHtml(html), "text/html");
  return (parsed.body.innerText || parsed.body.textContent || "").replace(/\u00a0/g, " ").trim();
}
function getEditorHtml(key) {
  const editor = root.querySelector('[data-rich-editor="' + key + '"]');
  return editor ? sanitizeRichHtml(editor.innerHTML) : "";
}
function getEditorLines(key) {
  const editor = root.querySelector('[data-rich-editor="' + key + '"]');
  if (!editor) return [];
  const text = (editor.innerText || editor.textContent || "").replace(/\u00a0/g, " ");
  return text.split(/\n+/).map(function (line) { return line.trim(); }).filter(Boolean);
}
function safeEditorContent(value) { return sanitizeRichHtml(value || ""); }

function renderLogin() {
  state.view = "login";
  const backendNotice = ADMIN_AUTH_CONFIGURED
    ? '<div class="notice"><span class="notice-mark" aria-hidden="true">i</span><span>Only accounts approved in the Supabase admin list can open this workspace. Admin changes are saved to the shared database and do not publish to the member hymnal yet.</span></div>'
    : '<div class="notice"><span class="notice-mark" aria-hidden="true">!</span><span>Admin sign-in is unavailable until the Supabase setup is completed.</span></div>';
  root.innerHTML = '<main class="login-layout"><section class="login-brand-panel" aria-label="Church hymnal administration"><div class="brand-lockup"><img src="../assets/demo-church-mark.svg" alt="" width="52" height="52"><span>Consolation Hymnal<br>Administration</span></div><div class="brand-copy"><p class="eyebrow">ADMIN WORKSPACE</p><h1>Care for the hymns that bring us together.</h1><p>A separate workspace for authorised church administrators. The member hymnal remains open to everyone, without an account.</p></div><p class="brand-panel-foot">Consolation Evangelical and Revival Church · “Occupy Till I Come”</p></section><section class="login-side"><div class="login-card"><img class="login-card-mark" src="../assets/demo-church-mark.svg" alt=""><p class="eyebrow" style="color:var(--purple)">ADMIN SIGN IN</p><h2>Welcome back</h2><p class="login-intro">Sign in with your approved administrator account.</p>' + backendNotice + '<form id="admin-login-form" novalidate><div class="field"><label for="admin-email">Email address</label><input id="admin-email" name="email" type="email" inputmode="email" autocomplete="username" placeholder="name@church.org" required></div><div class="field"><label for="admin-password">Password</label><div class="password-wrap"><input id="admin-password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required><button class="password-toggle" type="button" data-action="toggle-password" aria-controls="admin-password" aria-label="Show password">Show</button></div></div><p class="form-error" id="login-error" role="alert" aria-live="polite"></p><button class="button button-primary button-wide" id="login-submit" type="submit"><span class="login-button-label">Sign in</span></button></form><a class="public-link" href="../">← Open the public hymnal</a></div></section></main>';
}
function renderShell() {
  const navMarkup = navigation.map(function (item) {
    return '<button class="nav-item" type="button" data-action="navigate" data-view="' + item.id + '" aria-current="' + (state.activeView === item.id ? "page" : "false") + '"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + iconPaths[item.icon] + '</svg></span><span>' + item.label + '</span></button>';
  }).join("");
  root.innerHTML = '<div class="admin-shell"><aside class="sidebar" id="admin-sidebar"><div class="sidebar-brand"><img src="../assets/demo-church-mark.svg" alt=""><div><strong>Consolation Hymnal</strong><span>Admin workspace</span></div></div><p class="sidebar-label">Workspace</p><nav class="sidebar-nav" aria-label="Admin sections">' + navMarkup + '</nav><div class="sidebar-bottom"><button class="nav-item" type="button" data-action="logout"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg></span><span>Sign out</span></button><a class="sidebar-public-link" href="../">View public hymnal ↗</a></div></aside><button class="sidebar-backdrop" type="button" data-action="close-menu" aria-label="Close navigation" hidden></button><main class="admin-main"><header class="topbar"><div class="topbar-left"><button class="mobile-menu-button" type="button" data-action="toggle-menu" aria-label="Open admin navigation" aria-expanded="false" aria-controls="admin-sidebar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><div><p class="topbar-kicker">Consolation Evangelical and Revival Church</p><p class="topbar-title">Admin workspace</p></div></div><div class="topbar-right"><span class="preview-chip"><span class="preview-dot" aria-hidden="true"></span>Protected admin</span><span class="admin-avatar" aria-label="Signed-in administrator">A</span></div></header><div class="content-wrap" id="admin-content" tabindex="-1"></div><div class="app-toast" id="admin-toast" role="status" aria-live="polite" hidden></div></main></div>';
  renderCurrentView();
  getAdminSettings().then(function (settings) { applyAdminTheme(settings.defaultTheme); }).catch(function () { applyAdminTheme("system"); });
}
function closeMenu() {
  state.menuOpen = false;
  const sidebar = document.getElementById("admin-sidebar");
  const toggle = root.querySelector('[data-action="toggle-menu"]');
  const backdrop = root.querySelector(".sidebar-backdrop");
  if (sidebar) sidebar.classList.remove("is-open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  if (backdrop) backdrop.hidden = true;
}
function showToast(message) {
  const toast = document.getElementById("admin-toast");
  if (!toast) return;
  toast.textContent = String(message || "")
    .replace(/ for this open session only; browser storage is unavailable/g, " in the shared admin database")
    .replace(/ for this open session only/g, " in the shared admin database")
    .replace(/ for this session; browser storage is unavailable/g, " in the shared admin database")
    .replace(/^Saved in this open session only; browser storage is unavailable\./, "Saved in the shared admin database.")
    .replace(/this browser's demo data only/g, "the shared admin database")
    .replace(/this browser's demo data/g, "the shared admin database")
    .replace(/this browser preview/g, "the shared admin database")
    .replace(/this session; browser storage is unavailable/g, "the shared admin database");
  toast.hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(function () { toast.hidden = true; }, 4200);
}
function renderDashboard() {
  const content = document.getElementById("admin-content");
  content.replaceChildren();
  const heading = make("div", "page-heading");
  const titleBox = document.createElement("div");
  titleBox.append(make("h1", "", "Dashboard"), make("p", "", "A simple overview of the hymnal admin workspace."));
  heading.append(titleBox); content.append(heading);
  getDashboardStats().then(function (stats) {
    if (!document.getElementById("admin-content")) return;
    const cards = [
      ["Total Hymns", stats.totalHymns, "Shared admin database", "book"], ["Published Hymns", stats.publishedHymns, "Admin publication status", "check"],
      ["Draft Hymns", stats.draftHymns, "Saved drafts", "clock"], ["English Hymns", stats.englishHymns, "English entries", "language"],
      ["Yoruba Hymns", stats.yorubaHymns, "Yoruba entries", "language"], ["Categories", stats.categories, "Admin categories", "layers"],
      ["Upcoming Service Plans", stats.upcomingServicePlans, "Saved service plans", "calendar"]
    ];
    const grid = make("section", "stats-grid"); grid.setAttribute("aria-label", "Admin statistics");
    cards.forEach(function (item) {
      const card = make("article", "stat-card");
      const top = make("div", "stat-head"); top.append(make("span", "stat-label", item[0]), icon(item[3], "stat-icon"));
      card.append(top, make("p", "stat-value", String(item[1])), make("p", "stat-hint", item[2])); grid.append(card);
    });
    content.append(grid);
    const lower = make("div", "dashboard-lower");
    const recentPanel = make("section", "panel");
    const recentHeader = make("header", "panel-header"); const recentTitle = document.createElement("div");
    recentTitle.append(make("h2", "", "Recently Updated Hymns"), make("p", "", "Latest hymn changes in the admin database.")); recentHeader.append(recentTitle); recentPanel.append(recentHeader);
    const body = make("div", "panel-body"); const tableWrap = make("div", "table-wrap"); const table = make("table", "recent-table");
    table.innerHTML = '<thead><tr><th scope="col">Hymn</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector("tbody");
    getRecentlyUpdatedHymns(5).then(function (hymns) {
      hymns.forEach(function (hymn) {
        const row = document.createElement("tr"); const cell = document.createElement("td");
        cell.append(make("span", "hymn-name", hymn.title_en), make("span", "hymn-number", "Hymn #" + String(hymn.hymn_number).padStart(2, "0")));
        const statusCell = document.createElement("td"); statusCell.append(make("span", "status-pill " + (hymn.status === "published" ? "status-published" : "status-draft"), hymn.status === "published" ? "Published" : "Draft"));
        const dateCell = document.createElement("td"); const date = new Date(hymn.updated_at);
        dateCell.textContent = Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
        row.append(cell, statusCell, dateCell); tbody.append(row);
      });
    }).catch(function () { tbody.innerHTML = '<tr><td colspan="3">Hymn records are unavailable.</td></tr>'; });
    tableWrap.append(table); body.append(tableWrap); recentPanel.append(body);
    const actionsPanel = make("section", "panel"); const actionsHeader = make("header", "panel-header"); const actionsTitle = document.createElement("div");
    actionsTitle.append(make("h2", "", "Quick Actions"), make("p", "", "Shortcuts for hymnal management.")); actionsHeader.append(actionsTitle); actionsPanel.append(actionsHeader);
    const actionsBody = make("div", "panel-body"); const actions = [["Add New Hymn", "plus", "new-hymn"], ["Manage Hymns", "book", "open-hymns"], ["Manage Categories", "layers", "navigate", "categories"], ["Create Service Plan", "calendar", "navigate", "services"], ["Manage Upcoming Programs", "calendar", "navigate", "programs"]];
    const list = make("div", "quick-actions");
    actions.forEach(function (item) {
      const button = make("button", "quick-action", ""); button.type = "button"; button.dataset.action = item[2];
      if (item[3]) button.dataset.view = item[3];
      button.append(icon(item[1], "quick-action-icon"), make("span", "", item[0]), make("span", "quick-arrow", "›")); list.append(button);
    });
    actionsBody.append(list, make("p", "demo-caption", "Changes in this workspace are saved to Supabase and are not published to the member hymnal yet.")); actionsPanel.append(actionsBody);
    lower.append(recentPanel, actionsPanel); content.append(lower);
  }).catch(function () { content.append(make("section", "list-empty", "Admin data could not be loaded. Check the backend setup and connection.")); });
}
function renderPlaceholder(view) {
  const content = document.getElementById("admin-content"); content.replaceChildren();
  const item = navigation.find(function (entry) { return entry.id === view; }); const title = item ? item.label : "Dashboard";
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", title), make("p", "", "This section is not part of the current admin workflow.")); heading.append(headingContent); content.append(heading);
  const card = make("section", "placeholder-card"); const inner = make("div", "placeholder-inner");
  inner.append(icon(item ? item.icon : "grid", "placeholder-icon"), make("h2", "", "Not available"), make("p", "", "This admin section has not been implemented."));
  const back = make("button", "button button-secondary", "Back to dashboard"); back.type = "button"; back.dataset.action = "navigate"; back.dataset.view = "dashboard";
  inner.append(back); card.append(inner); content.append(card);
}
async function renderCategoryWorkspace() {
  if (state.categoryMode === "form") return renderCategoryForm();
  const content = document.getElementById("admin-content"); if (!content) return;
  content.replaceChildren();
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", "Categories"), make("p", "", "Create and organize the category labels used by hymns."));
  const addButton = make("button", "button button-primary", ""); addButton.type = "button"; addButton.dataset.action = "new-category"; addButton.append(icon("plus", ""), document.createTextNode(" Add Category"));
  heading.append(headingContent, addButton); content.append(heading);
  try {
    const results = await Promise.all([getCategories(), getHymns()]);
    const categories = results[0]; const hymns = results[1];
    const counts = new Map();
    hymns.forEach(function (hymn) { if (hymn.category) counts.set(hymn.category, (counts.get(hymn.category) || 0) + 1); });
    if (!categories.length) {
      const empty = make("section", "list-empty", "");
      empty.append(make("h2", "", "No categories yet"), make("p", "", "Add a category to organize hymns in the shared admin database."));
      const firstAdd = make("button", "button button-primary category-empty-action", "Add your first category"); firstAdd.type = "button"; firstAdd.dataset.action = "new-category"; empty.append(firstAdd); content.append(empty); return;
    }
    const rows = categories.map(function (category) {
      const escaped = escapeHtml(category); const count = counts.get(category) || 0;
      const usage = count + (count === 1 ? " hymn" : " hymns");
      const note = count ? "Reassign hymns before deleting" : "Not assigned to a hymn";
      const remove = count
        ? '<button class="row-action row-action-danger" type="button" disabled title="Reassign hymns before deleting" aria-label="Delete category ' + escaped + '">Delete</button>'
        : '<button class="row-action row-action-danger" type="button" data-action="delete-category" data-name="' + escaped + '" aria-label="Delete category ' + escaped + '">Delete</button>';
      return '<tr><td><span class="hymn-row-title">' + escaped + '</span></td><td><span class="category-usage">' + usage + '</span><span class="category-usage-note">' + note + '</span></td><td><div class="row-actions"><button class="row-action" type="button" data-action="edit-category" data-name="' + escaped + '" aria-label="Edit category ' + escaped + '">Edit</button>' + remove + '</div></td></tr>';
    }).join("");
    const table = make("div", "hymn-table-wrap category-table-wrap", "");
    table.innerHTML = '<table class="hymn-table category-table"><thead><tr><th scope="col">Category</th><th scope="col">Hymns</th><th scope="col">Actions</th></tr></thead><tbody>' + rows + '</tbody></table>';
    content.append(table);
  } catch (error) {
    content.append(make("section", "list-empty", "Categories could not be loaded from the admin database."));
  }
}
function renderCategoryForm() {
  const content = document.getElementById("admin-content"); if (!content) return;
  content.replaceChildren();
  const editing = state.editingCategoryName !== null; const currentName = editing ? state.editingCategoryName : "";
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", editing ? "Edit Category" : "Add Category"), make("p", "", editing ? "Rename a category used by existing hymns." : "Create a category for organizing hymns."));
  heading.append(headingContent); content.append(heading);
  const panel = make("section", "panel form-panel"); panel.setAttribute("aria-label", editing ? "Edit category form" : "Add category form");
  panel.innerHTML = '<form id="category-form" novalidate><h2 class="form-section-title">Category details</h2><p class="form-section-help">Category changes are saved to the shared database. Renaming updates the category reference on its existing hymns.</p><div class="admin-field"><label for="category-name">Category name <span aria-hidden="true">*</span></label><input class="form-input" id="category-name" name="category_name" type="text" maxlength="60" autocomplete="off" value="' + escapeHtml(currentName) + '" required><p class="field-hint">Use up to 60 characters. Category names must be unique.</p></div><div id="category-errors" class="form-errors" role="alert" aria-live="polite" hidden></div><div class="form-actions"><div class="form-actions-left"></div><div class="form-actions-right"><button class="button button-secondary" type="button" data-action="cancel-category">Cancel</button><button class="button button-primary" type="submit">Save Category</button></div></div></form>';
  content.append(panel); state.categoryFormStart = currentName;
  const input = document.getElementById("category-name"); if (!editing && input) input.focus({ preventScroll: true });
}
function showCategoryErrors(errors) {
  const box = document.getElementById("category-errors"); if (!box) return;
  box.textContent = errors.join(" "); box.hidden = !errors.length;
}
async function saveCategoryForm(submitter) {
  const input = document.getElementById("category-name"); if (!input) return;
  const name = input.value.trim(); const editing = state.editingCategoryName !== null; const originalName = state.editingCategoryName;
  const errors = [];
  if (!name) errors.push("Enter a category name.");
  if (name.length > 60) errors.push("Category names must be 60 characters or fewer.");
  if (name) {
    const categories = await getCategories();
    if (categories.some(function (category) { return category !== originalName && category.toLowerCase() === name.toLowerCase(); })) errors.push("A category with that name already exists.");
  }
  if (errors.length) { showCategoryErrors(errors); input.focus(); return; }
  const button = submitter || document.querySelector('#category-form button[type="submit"]');
  if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); }
  try {
    const mode = editing ? await updateCategory(originalName, name) : await createCategory(name);
    state.categoryMode = "list"; state.editingCategoryName = null; state.categoryFormStart = null;
    await renderCategoryWorkspace();
    const verb = editing ? "renamed" : "created";
    showToast(mode === "browser" ? "Category " + verb + " in this browser's demo data." : "Category " + verb + " for this open session only; browser storage is unavailable.");
  } catch (error) {
    showCategoryErrors([error && error.message ? error.message : "The category could not be saved."]);
    input.focus();
  } finally {
    if (button && button.isConnected) { button.disabled = false; button.removeAttribute("aria-busy"); }
  }
}
async function cancelCategoryForm() {
  if (isCategoryFormDirty() && !window.confirm("Discard your unsaved category changes?")) return;
  state.categoryMode = "list"; state.editingCategoryName = null; state.categoryFormStart = null;
  await renderCategoryWorkspace();
}
async function removeCategoryFromPreview(name) {
  const hymns = await getHymns();
  if (hymns.some(function (hymn) { return hymn.category === name; })) { showToast("Reassign the hymns in this category before deleting it."); return; }
  if (!window.confirm('Delete the category "' + name + '" from the admin database?')) return;
  try {
    const mode = await deleteCategory(name);
    if (!mode) { showToast("That category is no longer available."); return; }
    await renderCategoryWorkspace();
    showToast(mode === "browser" ? "Category deleted from this browser's demo data." : "Category deleted for this open session only; browser storage is unavailable.");
  } catch (error) { showToast(error.message || "The category could not be deleted."); }
}
async function renderServiceWorkspace() {
  if (state.serviceMode === "form") return renderServiceForm();
  const content = document.getElementById("admin-content"); if (!content) return;
  content.replaceChildren();
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", "Service Planner"), make("p", "", "Plan services and select the hymns for each gathering."));
  const addButton = make("button", "button button-primary", ""); addButton.type = "button"; addButton.dataset.action = "new-service"; addButton.append(icon("plus", ""), document.createTextNode(" Create Service Plan"));
  heading.append(headingContent, addButton); content.append(heading);
  try {
    const results = await Promise.all([getServicePlans(), getHymns()]);
    const plans = results[0]; const hymns = results[1]; const hymnById = new Map(hymns.map(function (hymn) { return [hymn.id, hymn]; }));
    if (!plans.length) {
      const empty = make("section", "list-empty", "");
      empty.append(make("h2", "", "No service plans yet"), make("p", "", "Create a plan and choose the hymns for your next service."));
      const firstAdd = make("button", "button button-primary category-empty-action", "Create your first service plan"); firstAdd.type = "button"; firstAdd.dataset.action = "new-service"; empty.append(firstAdd); content.append(empty); return;
    }
    const rows = plans.map(function (plan) {
      const escapedId = escapeHtml(plan.id); const title = escapeHtml(plan.title || "Untitled service");
      const dateValue = String(plan.date || ""); const date = new Date(dateValue + "T00:00:00");
      const dateText = Number.isNaN(date.getTime()) ? dateValue : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
      const selected = (plan.hymn_ids || []).map(function (id) {
        const hymn = hymnById.get(id);
        return hymn ? "#" + hymn.hymn_number + " · " + (hymn.title_en || hymn.title_yoruba || "Untitled hymn") : "Hymn no longer available";
      });
      const names = selected.length ? selected.join(" · ") : "No hymns selected";
      return '<tr><td><span class="hymn-row-title">' + title + '</span><span class="hymn-row-subtitle">' + selected.length + (selected.length === 1 ? " hymn" : " hymns") + '</span></td><td>' + escapeHtml(dateText) + '</td><td class="service-hymn-summary">' + escapeHtml(names) + '</td><td><div class="row-actions"><button class="row-action" type="button" data-action="edit-service" data-id="' + escapedId + '" aria-label="Edit service plan ' + title + '">Edit</button><button class="row-action row-action-danger" type="button" data-action="delete-service" data-id="' + escapedId + '" aria-label="Delete service plan ' + title + '">Delete</button></div></td></tr>';
    }).join("");
    const table = make("div", "hymn-table-wrap service-table-wrap", "");
    table.innerHTML = '<table class="hymn-table service-table"><thead><tr><th scope="col">Service</th><th scope="col">Date</th><th scope="col">Planned hymns</th><th scope="col">Actions</th></tr></thead><tbody>' + rows + '</tbody></table>';
    content.append(table);
  } catch (error) {
    content.append(make("section", "list-empty", "Service plans could not be loaded from the admin database."));
  }
}
async function renderServiceForm() {
  const content = document.getElementById("admin-content"); if (!content) return;
  const existing = state.editingServiceId ? await getServicePlan(state.editingServiceId) : null;
  if (state.editingServiceId && !existing) { state.serviceMode = "list"; state.editingServiceId = null; showToast("That service plan is no longer available."); return renderServiceWorkspace(); }
  const hymns = await getHymns(); const selectedIds = existing ? existing.hymn_ids || [] : [];
  content.replaceChildren();
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", existing ? "Edit Service Plan" : "Create Service Plan"), make("p", "", existing ? "Update the service details and selected hymns." : "Choose a date and the hymns for this service."));
  heading.append(headingContent); content.append(heading);
  const options = hymns.map(function (hymn) {
    const checked = selectedIds.includes(hymn.id) ? " checked" : "";
    const headingText = "Hymn #" + hymn.hymn_number + " · " + (hymn.title_en || hymn.title_yoruba || "Untitled hymn");
    const firstLine = hymn.first_line_en || hymn.first_line_yoruba || "First line not added";
    return '<label class="service-hymn-option" for="service-hymn-' + escapeHtml(hymn.id) + '"><input type="checkbox" id="service-hymn-' + escapeHtml(hymn.id) + '" name="service_hymn_ids" value="' + escapeHtml(hymn.id) + '"' + checked + '><span class="service-hymn-copy"><strong>' + escapeHtml(headingText) + '</strong><span>' + escapeHtml(firstLine) + '</span></span></label>';
  }).join("");
  const now = new Date(); const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const panel = make("section", "panel form-panel"); panel.setAttribute("aria-label", existing ? "Edit service plan form" : "Create service plan form");
  panel.innerHTML = '<form id="service-form" novalidate><h2 class="form-section-title">Service details</h2><p class="form-section-help">Plans are saved only in this browser preview. They do not publish changes to the public hymnal.</p><div class="hymn-fields-grid"><div class="admin-field"><label for="service-title">Service name <span aria-hidden="true">*</span></label><input class="form-input" id="service-title" name="service_title" type="text" maxlength="100" value="' + escapeHtml(existing ? existing.title : "") + '" placeholder="Sunday service" required></div><div class="admin-field"><label for="service-date">Service date <span aria-hidden="true">*</span></label><input class="form-input" id="service-date" name="service_date" type="date" min="' + today + '" value="' + escapeHtml(existing ? existing.date : "") + '" required></div></div><section class="service-hymn-section" aria-labelledby="service-hymn-heading"><div class="service-hymn-heading"><div><h2 id="service-hymn-heading" tabindex="-1">Choose hymns</h2><p>Select at least one hymn for this service.</p></div><span class="service-hymn-count" id="service-hymn-count" aria-live="polite"></span></div><div class="service-hymn-picker">' + (options || '<p class="service-empty-hymns">No demo hymns are available yet. Add a hymn before creating a service plan.</p>') + '</div></section><div id="service-errors" class="form-errors" role="alert" aria-live="polite" hidden></div><div class="form-actions"><div class="form-actions-left"></div><div class="form-actions-right"><button class="button button-secondary" type="button" data-action="cancel-service">Cancel</button><button class="button button-primary" type="submit">Save Service Plan</button></div></div></form>';
  panel.innerHTML = panel.innerHTML.replace("Plans are saved only in this browser preview. They do not publish changes to the public hymnal.", "Plans are saved to the shared database and remain admin-only until the public app is connected.")
    .replace("No demo hymns are available yet.", "No hymns are available yet.");
  content.append(panel); state.serviceFormStart = serviceFormSignature(); updateServiceHymnCount();
  const first = document.getElementById("service-title"); if (!existing && first) first.focus({ preventScroll: true });
}
function updateServiceHymnCount() {
  const form = document.getElementById("service-form"); const count = document.getElementById("service-hymn-count");
  if (!form || !count) return;
  const selected = form.querySelectorAll('input[name="service_hymn_ids"]:checked').length;
  count.textContent = selected + (selected === 1 ? " hymn selected" : " hymns selected");
}
function showServiceErrors(errors) {
  const box = document.getElementById("service-errors"); if (!box) return;
  box.textContent = errors.join(" "); box.hidden = !errors.length;
}
async function saveServiceForm(submitter) {
  const form = document.getElementById("service-form"); if (!form) return;
  const data = { title: form.elements.service_title.value.trim(), date: form.elements.service_date.value, hymn_ids: Array.from(form.querySelectorAll('input[name="service_hymn_ids"]:checked')).map(function (input) { return input.value; }) };
  const errors = [];
  if (!data.title) errors.push("Enter a service name.");
  if (data.title.length > 100) errors.push("Service names must be 100 characters or fewer.");
  if (!data.date) errors.push("Choose a service date.");
  if (!data.hymn_ids.length) errors.push("Select at least one hymn.");
  if (errors.length) { showServiceErrors(errors); if (!data.title) form.elements.service_title.focus(); else if (!data.date) form.elements.service_date.focus(); else document.getElementById("service-hymn-heading").focus(); return; }
  const button = submitter || form.querySelector('button[type="submit"]');
  if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); }
  const editing = state.editingServiceId !== null; const id = state.editingServiceId;
  try {
    const mode = editing ? await updateService(id, data) : await createService(data);
    state.serviceMode = "list"; state.editingServiceId = null; state.serviceFormStart = null;
    await renderServiceWorkspace();
    const message = editing ? "Service plan updated." : "Service plan created.";
    showToast(mode === "browser" ? message + " Saved in this browser's demo data." : message + " Saved for this open session only; browser storage is unavailable.");
  } catch (error) {
    showServiceErrors([error && error.message ? error.message : "The service plan could not be saved."]);
  } finally {
    if (button && button.isConnected) { button.disabled = false; button.removeAttribute("aria-busy"); }
  }
}
async function cancelServiceForm() {
  if (isServiceFormDirty() && !window.confirm("Discard your unsaved service plan changes?")) return;
  state.serviceMode = "list"; state.editingServiceId = null; state.serviceFormStart = null;
  await renderServiceWorkspace();
}
async function removeServiceFromPreview(id) {
  const service = await getServicePlan(id); if (!service) { showToast("That demo service plan is no longer available."); return; }
  if (!window.confirm('Delete the service plan "' + service.title + '" from the admin database?')) return;
  try {
    const mode = await deleteService(id);
    if (!mode) { showToast("That service plan could not be found."); return; }
    await renderServiceWorkspace();
    showToast(mode === "browser" ? "Service plan deleted from this browser's demo data." : "Service plan deleted for this open session only; browser storage is unavailable.");
  } catch (error) { showToast(error.message || "The service plan could not be deleted."); }
}
async function renderProgramWorkspace() {
  if (state.programMode === "form") return renderProgramForm();
  const content = document.getElementById("admin-content"); if (!content) return;
  content.replaceChildren();
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", "Upcoming Programs"), make("p", "", "Prepare church program announcements and review responses when the app is connected."));
  const addButton = make("button", "button button-primary", ""); addButton.type = "button"; addButton.dataset.action = "new-program"; addButton.append(icon("plus", ""), document.createTextNode(" Add Program"));
  heading.append(headingContent, addButton); content.append(heading);
  const note = make("section", "program-analytics-note");
  note.append(make("strong", "", "Views and attendance responses are not connected yet."), make("p", "", "This phase builds the admin workflow only. Counts will become real after the public app and backend are connected."));
  content.append(note);
  try {
    const programs = await getPrograms();
    if (!programs.length) {
      const empty = make("section", "list-empty", "");
      empty.append(make("h2", "", "No programs added yet"), make("p", "", "Create an upcoming program with its venue, dates, flyer, and response wording."));
      const firstAdd = make("button", "button button-primary category-empty-action", "Create your first program"); firstAdd.type = "button"; firstAdd.dataset.action = "new-program"; empty.append(firstAdd); content.append(empty); return;
    }
    const list = make("section", "program-list"); list.setAttribute("aria-label", "Church programs");
    const today = new Date(); const todayValue = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    programs.forEach(function (program) {
      const card = make("article", "program-card");
      const flyer = make("div", "program-card-flyer");
      if (program.flyerDataUrl) {
        const image = make("img", "program-card-image"); image.src = program.flyerDataUrl; image.alt = "Flyer for " + (program.title || "church program"); flyer.append(image);
      } else {
        flyer.append(make("span", "program-flyer-empty", "No flyer added"));
      }
      const detail = make("div", "program-card-details");
      const dateStatus = program.endDate || program.startDate;
      const badge = make("span", "program-status-pill " + (dateStatus >= todayValue ? "program-status-upcoming" : "program-status-past"), dateStatus >= todayValue ? "Upcoming" : "Past");
      const title = make("h2", "", program.title || "Untitled program");
      const venue = make("p", "program-card-venue", program.venue || "Venue not added");
      const dates = make("p", "program-card-date", formatProgramDateRange(program.startDate, program.endDate));
      const prompt = make("p", "program-card-response", program.responseQuestion || "Availability question not added");
      const options = make("p", "program-card-options", (program.yesLabel || "Yes") + " · " + (program.noLabel || "No"));
      const metrics = make("div", "program-metrics");
      [["Views", "Analytics pending"], ["Interested", "Analytics pending"]].forEach(function (metric) {
        const item = make("div", "program-metric"); item.append(make("span", "", metric[0]), make("strong", "", "—"), make("small", "", metric[1])); metrics.append(item);
      });
      const actions = make("div", "program-card-actions");
      const edit = make("button", "button button-secondary", "Edit program"); edit.type = "button"; edit.dataset.action = "edit-program"; edit.dataset.id = program.id;
      const remove = make("button", "row-action row-action-danger", "Delete"); remove.type = "button"; remove.dataset.action = "delete-program"; remove.dataset.id = program.id;
      actions.append(edit, remove);
      detail.append(badge, title, venue, dates, prompt, options, metrics, actions);
      card.append(flyer, detail); list.append(card);
    });
    content.append(list);
  } catch (error) {
    content.append(make("section", "list-empty", "Programs could not be loaded from the admin database."));
  }
}
function formatProgramDateRange(startDate, endDate) {
  function format(value) {
    const date = new Date(String(value || "") + "T00:00:00");
    return Number.isNaN(date.getTime()) ? String(value || "Date not set") : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(date);
  }
  return endDate ? format(startDate) + " – " + format(endDate) : format(startDate);
}
async function renderProgramForm() {
  const content = document.getElementById("admin-content"); if (!content) return;
  const existing = state.editingProgramId ? await getProgram(state.editingProgramId) : null;
  if (state.editingProgramId && !existing) { state.programMode = "list"; state.editingProgramId = null; showToast("That program is no longer available."); return renderProgramWorkspace(); }
  state.programFlyerUrl = existing ? existing.flyerDataUrl || "" : "";
  content.replaceChildren();
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", existing ? "Edit Program" : "Add Upcoming Program"), make("p", "", existing ? "Update the program details and response wording." : "Add the event details that will later appear in the connected hymnal app."));
  const cancel = make("button", "button button-secondary", "Cancel"); cancel.type = "button"; cancel.dataset.action = "cancel-program";
  heading.append(headingContent, cancel); content.append(heading);
  const program = existing || { title: "", venue: "", startDate: "", endDate: "", responseQuestion: "Will you be available for this program?", yesLabel: "Yes, I’ll be there", noLabel: "Not this time" };
  const panel = make("section", "panel form-panel"); panel.setAttribute("aria-label", existing ? "Edit program form" : "Add program form");
  panel.innerHTML = '<form id="program-form" novalidate><h2 class="form-section-title">Program details</h2><p class="form-section-help">Program changes stay in this browser preview and are not published to the public app in this phase.</p><div class="hymn-fields-grid"><div class="admin-field"><label for="program-title">Program name <span aria-hidden="true">*</span></label><input class="form-input" id="program-title" name="title" type="text" maxlength="120" placeholder="Annual Thanksgiving Service" value="' + escapeHtml(program.title) + '" required></div><div class="admin-field"><label for="program-venue">Venue <span aria-hidden="true">*</span></label><input class="form-input" id="program-venue" name="venue" type="text" maxlength="160" placeholder="Church auditorium" value="' + escapeHtml(program.venue) + '" required></div><div class="admin-field"><label for="program-start-date">From <span aria-hidden="true">*</span></label><input class="form-input" id="program-start-date" name="startDate" type="date" value="' + escapeHtml(program.startDate) + '" required></div><div class="admin-field"><label for="program-end-date">To <span class="optional-label">optional</span></label><input class="form-input" id="program-end-date" name="endDate" type="date" value="' + escapeHtml(program.endDate || "") + '"><p class="field-hint">Leave this blank for a one-day program.</p></div></div><section class="program-flyer-section" aria-labelledby="program-flyer-heading"><h2 id="program-flyer-heading">Program flyer</h2><p>Upload a PNG, JPEG, or WebP image. The preview keeps the full flyer visible without cropping.</p><label class="button button-secondary flyer-upload-button" for="program-flyer-input">Choose flyer</label><input class="visually-hidden" id="program-flyer-input" type="file" accept="image/png,image/jpeg,image/webp"><div id="program-flyer-preview" class="program-flyer-preview" aria-live="polite"></div><p class="field-hint">Large images are resized proportionally for this browser preview. A server-backed upload will be added later.</p><p id="program-flyer-error" class="form-error" role="alert" aria-live="polite"></p></section><section class="program-response-section"><h2>Attendance response</h2><p>Set the question and the wording shown on the two response buttons.</p><div class="hymn-fields-grid"><div class="admin-field"><label for="program-response-question">Question shown to users</label><input class="form-input" id="program-response-question" name="responseQuestion" type="text" maxlength="120" value="' + escapeHtml(program.responseQuestion) + '" required></div><div class="admin-field"><label for="program-yes-label">Yes button</label><input class="form-input" id="program-yes-label" name="yesLabel" type="text" maxlength="48" value="' + escapeHtml(program.yesLabel) + '" required></div><div class="admin-field"><label for="program-no-label">No button</label><input class="form-input" id="program-no-label" name="noLabel" type="text" maxlength="48" value="' + escapeHtml(program.noLabel) + '" required></div></div></section><div id="program-errors" class="form-errors" role="alert" aria-live="polite" hidden></div><div class="form-actions"><div class="form-actions-left">' + (existing ? '<button class="button button-danger" type="button" data-action="delete-program" data-id="' + escapeHtml(existing.id) + '">Delete Program</button>' : "") + '</div><div class="form-actions-right"><button class="button button-secondary" type="button" data-action="cancel-program">Cancel</button><button class="button button-primary" type="submit">Save Program</button></div></div></form>';
  panel.innerHTML = panel.innerHTML
    .replace("Program changes stay in this browser preview and are not published to the public app in this phase.", "Program changes are saved to the shared database and are not published to the public app yet.")
    .replace("Large images are resized proportionally for this browser preview. A server-backed upload will be added later.", "Large images are resized proportionally before they are stored with this program.");
  content.append(panel);
  updateProgramFlyerPreview(state.programFlyerUrl);
  state.programFormStart = programFormSignature();
  const first = document.getElementById("program-title"); if (!existing && first) first.focus({ preventScroll: true });
}
function currentProgramFormData() {
  const form = document.getElementById("program-form"); if (!form) return null;
  return {
    title: form.elements.title.value.trim(), venue: form.elements.venue.value.trim(),
    startDate: form.elements.startDate.value, endDate: form.elements.endDate.value,
    flyerDataUrl: state.programFlyerUrl,
    responseQuestion: form.elements.responseQuestion.value.trim(),
    yesLabel: form.elements.yesLabel.value.trim(), noLabel: form.elements.noLabel.value.trim()
  };
}
function programFormSignature() {
  const data = currentProgramFormData(); return data ? JSON.stringify(data) : null;
}
function updateProgramFlyerPreview(dataUrl) {
  const preview = document.getElementById("program-flyer-preview"); if (!preview) return;
  preview.replaceChildren();
  if (dataUrl) {
    const image = make("img", "program-flyer-preview-image"); image.src = dataUrl; image.alt = "Full program flyer preview";
    const remove = make("button", "row-action row-action-danger", "Remove flyer"); remove.type = "button"; remove.dataset.action = "remove-program-flyer";
    preview.append(image, remove);
  } else {
    preview.append(make("p", "program-flyer-placeholder", "No flyer selected. You can add one now or return to it later."));
  }
}
function optimizeProgramFlyer(file) {
  return new Promise(function (resolve, reject) {
    if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) { reject(new Error("Choose a PNG, JPEG, or WebP image.")); return; }
    if (file.size > 12000000) { reject(new Error("Choose an image smaller than 12 MB before resizing.")); return; }
    const source = URL.createObjectURL(file); const image = new Image();
    image.onload = function () {
      URL.revokeObjectURL(source);
      const width = image.naturalWidth; const height = image.naturalHeight;
      if (!width || !height) { reject(new Error("The selected image could not be read.")); return; }
      const scale = Math.min(1, 1800 / Math.max(width, height));
      const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      if (!context) { reject(new Error("Flyer preview is not supported in this browser.")); return; }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let output = canvas.toDataURL("image/webp", 0.88);
      if (!output.startsWith("data:image/webp")) {
        context.fillStyle = "#ffffff"; context.globalCompositeOperation = "destination-over"; context.fillRect(0, 0, canvas.width, canvas.height);
      }
      for (let quality = 0.88; output.length > 1800000 && quality >= 0.48; quality -= 0.08) {
        output = output.startsWith("data:image/webp") ? canvas.toDataURL("image/webp", quality) : canvas.toDataURL("image/jpeg", quality);
      }
      if (output.length > 1800000) { reject(new Error("This flyer is still too large after resizing. Choose a smaller image.")); return; }
      resolve(output);
    };
    image.onerror = function () { URL.revokeObjectURL(source); reject(new Error("The selected image could not be opened.")); };
    image.src = source;
  });
}
function showProgramErrors(errors) {
  const box = document.getElementById("program-errors"); if (!box) return;
  box.textContent = errors.join(" "); box.hidden = !errors.length;
}
async function saveProgramForm(submitter) {
  const data = currentProgramFormData(); if (!data) return;
  const errors = [];
  if (!data.title) errors.push("Enter the program name.");
  if (!data.venue) errors.push("Enter the venue.");
  if (!data.startDate) errors.push("Choose a start date.");
  if (data.endDate && data.startDate && data.endDate < data.startDate) errors.push("The end date cannot be before the start date.");
  if (!data.responseQuestion) errors.push("Enter the attendance question.");
  if (!data.yesLabel || !data.noLabel) errors.push("Enter both response button labels.");
  if (errors.length) { showProgramErrors(errors); if (!data.title) document.getElementById("program-title").focus(); else if (!data.venue) document.getElementById("program-venue").focus(); else if (!data.startDate) document.getElementById("program-start-date").focus(); return; }
  const button = submitter || document.querySelector('#program-form button[type="submit"]');
  if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); }
  const editing = state.editingProgramId !== null; const id = state.editingProgramId;
  try {
    const saved = editing ? await updateProgram(id, data) : await createProgram(data);
    state.programMode = "list"; state.editingProgramId = null; state.programFormStart = null; state.programFlyerUrl = "";
    await renderProgramWorkspace();
    showToast(saved._storage_mode === "browser" ? "Program saved in this browser preview." : "Program saved for this open session only; browser storage is unavailable.");
  } catch (error) {
    showProgramErrors([error && error.message ? error.message : "The program could not be saved."]);
  } finally {
    if (button && button.isConnected) { button.disabled = false; button.removeAttribute("aria-busy"); }
  }
}
async function cancelProgramForm() {
  if (isProgramFormDirty() && !window.confirm("Discard your unsaved program changes?")) return;
  state.programMode = "list"; state.editingProgramId = null; state.programFormStart = null; state.programFlyerUrl = "";
  await renderProgramWorkspace();
}
async function removeProgramFromPreview(id) {
  const program = await getProgram(id); if (!program) { showToast("That demo program is no longer available."); return; }
  if (!window.confirm('Delete the program "' + program.title + '" from the admin database?')) return;
  try {
    const mode = await deleteProgram(id);
    if (!mode) { showToast("That program could not be found."); return; }
    state.programMode = "list"; state.editingProgramId = null; state.programFormStart = null;
    await renderProgramWorkspace();
    showToast(mode === "browser" ? "Program deleted from this browser preview." : "Program deleted for this open session only; browser storage is unavailable.");
  } catch (error) { showToast(error.message || "The program could not be deleted."); }
}
async function renderSettingsWorkspace() {
  const content = document.getElementById("admin-content"); if (!content) return;
  content.replaceChildren();
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", "Settings"), make("p", "", "Admin-only preferences saved in Supabase."));
  heading.append(headingContent); content.append(heading);
  try {
    const results = await Promise.all([getCategories(), getAdminSettings(), getDailyQuoteSettings()]);
    const categories = results[0]; const settings = results[1]; const quoteSettings = results[2];
    const themeMode = ["system", "light", "dark"].includes(settings.defaultTheme) ? settings.defaultTheme : "system";
    applyAdminTheme(themeMode);
    const darkEnabled = themeMode === "dark" || (themeMode === "system" && getSystemTheme() === "dark");
    const options = categories.map(function (category) { return '<option value="' + escapeHtml(category) + '"' + (category === settings.defaultHymnCategory ? " selected" : "") + '>' + escapeHtml(category) + '</option>'; }).join("");
    const panel = make("section", "panel form-panel settings-preferences");
    panel.innerHTML = '<form id="settings-form" novalidate><h2 class="form-section-title">Hymn editor</h2><p class="form-section-help">Set a default for the next hymn you add. Existing hymns are not changed by this preference.</p><div class="admin-field"><label for="default-hymn-category">Default category for new hymns</label><select class="form-select" id="default-hymn-category" name="default_hymn_category"><option value=""' + (!settings.defaultHymnCategory ? " selected" : "") + '>Choose a category each time</option>' + options + '</select><p class="field-hint">The selected category will be prefilled in the Add New Hymn form. You can change it before saving.</p></div><div id="settings-errors" class="form-errors" role="alert" aria-live="polite" hidden></div><div class="form-actions"><div class="form-actions-left"></div><div class="form-actions-right"><button class="button button-primary" type="submit">Save Preference</button></div></div></form>';
    const appearancePanel = make("section", "panel settings-appearance");
    appearancePanel.innerHTML = '<header class="panel-header"><div><h2>Appearance</h2><p>Set the default theme for the admin web app.</p></div></header><div class="panel-body"><div class="theme-setting-row"><div><strong>Dark theme</strong><p id="theme-current-description">' + (themeMode === "system" ? "Following device theme (currently " + getSystemTheme() + ")." : (themeMode === "dark" ? "Dark theme is set for this admin workspace." : "Light theme is set for this admin workspace.")) + '</p></div><button type="button" id="admin-theme-switch" class="theme-switch-control" role="switch" aria-label="Dark theme" aria-checked="' + String(darkEnabled) + '" data-action="toggle-admin-theme"><span class="theme-switch-track" aria-hidden="true"><span></span></span></button></div><div class="theme-system-row"><span>Let this device choose light or dark.</span><button type="button" class="button button-secondary" data-action="use-system-theme" aria-pressed="' + String(themeMode === "system") + '">Use device theme</button></div></div>';
    const statusPanel = make("section", "panel settings-status");
    const statusHeader = make("header", "panel-header", ""); const statusTitle = document.createElement("div");
    statusTitle.append(make("h2", "", "Backend status"), make("p", "", "What is connected in this phase.")); statusHeader.append(statusTitle);
    const statusBody = make("div", "panel-body", "");
    const statusList = make("ul", "settings-status-list", "");
    statusList.append(make("li", "", "Administrator access and admin records are protected by Supabase Auth and row-level security."), make("li", "", "Hymns, categories, service plans, programs, and settings are saved to the shared database."), make("li", "", "Public-site publishing, app responses, and program analytics are not connected yet."));
    statusBody.append(statusList); statusPanel.append(statusHeader, statusBody);
    const grid = make("div", "settings-grid", ""); grid.append(panel, appearancePanel, statusPanel); content.append(grid);
    const programSettings = make("section", "panel settings-module");
    programSettings.innerHTML = '<header class="panel-header"><div><h2>Upcoming programs</h2><p>Create and edit event announcements, flyers, and attendance wording.</p></div></header><div class="panel-body"><p class="settings-module-copy">The program manager is available in the admin menu. View counts and attendance totals will appear after the public app and backend are connected.</p><button class="button button-secondary" type="button" data-action="navigate" data-view="programs">Open Upcoming Programs</button></div>';
    const quotePanel = make("section", "panel settings-module quote-settings");
    quotePanel.innerHTML = '<header class="panel-header"><div><h2>Daily Scripture Quote</h2><p>Choose the scripture sources and when the quote should refresh.</p></div></header><div class="panel-body"><form id="daily-quote-form" novalidate><label class="quote-enable-row"><input id="daily-quote-enabled" name="enabled" type="checkbox"' + (quoteSettings.enabled ? " checked" : "") + '><span><strong>Enable the quote feature</strong><small>Controls the planned quote feature in the member hymnal.</small></span></label><fieldset class="quote-source-fieldset"><legend>Allowed Bible books</legend><label class="quote-source-option"><input type="checkbox" name="quote_books" value="Psalms"' + (quoteSettings.books.includes("Psalms") ? " checked" : "") + '><span>Psalms</span></label><label class="quote-source-option"><input type="checkbox" name="quote_books" value="Proverbs"' + (quoteSettings.books.includes("Proverbs") ? " checked" : "") + '><span>Proverbs</span></label></fieldset><div class="admin-field"><label for="quote-refresh-mode">When should a new quote be generated?</label><select class="form-select" id="quote-refresh-mode" name="refreshMode"><option value="on-open"' + (quoteSettings.refreshMode === "on-open" ? " selected" : "") + '>Every time a user opens the app</option><option value="daily"' + (quoteSettings.refreshMode === "daily" ? " selected" : "") + '>Once per day</option></select><p class="field-hint">This preference is saved in the browser preview; the public quote will be wired in the backend phase.</p></div><div class="quote-provider-notice"><strong>Groq connection · Not configured</strong><p>Add the Groq API key as a server secret in the backend phase. It should never be entered or stored in this browser page.</p></div><div id="quote-settings-errors" class="form-errors" role="alert" aria-live="polite" hidden></div><div class="form-actions"><div class="form-actions-left"></div><div class="form-actions-right"><button class="button button-primary" type="submit">Save Quote Settings</button></div></div></form></div>';
    quotePanel.innerHTML = quotePanel.innerHTML.replace(
      "This preference is saved in the browser preview; the public quote will be wired in the backend phase.",
      "These preferences are saved to Supabase. Quote generation and display in the member app are separate work."
    ).replace("Add the Groq API key as a server secret in the backend phase.", "Add the Groq API key as a server secret when quote generation is implemented.");
    const modules = make("div", "settings-modules-grid"); modules.append(programSettings, quotePanel); content.append(modules);
    state.settingsFormStart = settings.defaultHymnCategory || "";
    state.quoteSettingsFormStart = quoteSettingsFormSignature();
  } catch (error) {
    content.append(make("section", "list-empty", "Workspace settings could not be loaded."));
  }
}
function showSettingsErrors(message) {
  const box = document.getElementById("settings-errors"); if (!box) return;
  box.textContent = message || ""; box.hidden = !message;
}
async function saveSettingsForm() {
  const select = document.getElementById("default-hymn-category"); if (!select) return;
  try {
    const mode = await updateAdminSettings({ defaultHymnCategory: select.value });
    state.settingsFormStart = null;
    await renderSettingsWorkspace();
    showToast(mode === "browser" ? "Workspace preference saved in this browser." : "Preference saved for this open session only; browser storage is unavailable.");
  } catch (error) {
    showSettingsErrors(error && error.message ? error.message : "The preference could not be saved.");
  }
}
function quoteSettingsFormSignature() {
  const form = document.getElementById("daily-quote-form"); if (!form) return null;
  const books = Array.from(form.querySelectorAll('input[name="quote_books"]:checked')).map(function (input) { return input.value; }).sort();
  return JSON.stringify({ enabled: form.elements.enabled.checked, books: books, refreshMode: form.elements.refreshMode.value });
}
async function saveDailyQuoteSettings() {
  const form = document.getElementById("daily-quote-form"); if (!form) return;
  const data = {
    enabled: form.elements.enabled.checked,
    books: Array.from(form.querySelectorAll('input[name="quote_books"]:checked')).map(function (input) { return input.value; }),
    refreshMode: form.elements.refreshMode.value
  };
  const errors = document.getElementById("quote-settings-errors");
  if (!data.books.length) { if (errors) { errors.textContent = "Choose Psalms, Proverbs, or both as quote sources."; errors.hidden = false; } return; }
  try {
    const mode = await updateDailyQuoteSettings(data);
    state.quoteSettingsFormStart = null;
    await renderSettingsWorkspace();
    showToast(mode === "browser" ? "Quote settings saved in this browser preview." : "Quote settings saved for this open session only; browser storage is unavailable.");
  } catch (error) {
    if (errors) { errors.textContent = error && error.message ? error.message : "Quote settings could not be saved."; errors.hidden = false; }
  }
}
function renderCurrentView() {
  root.querySelectorAll(".nav-item[data-view]").forEach(function (button) { button.setAttribute("aria-current", button.dataset.view === state.activeView ? "page" : "false"); });
  if (state.activeView === "dashboard") renderDashboard();
  else if (state.activeView === "hymns") renderHymnWorkspace();
  else if (state.activeView === "categories") renderCategoryWorkspace();
  else if (state.activeView === "services") renderServiceWorkspace();
  else if (state.activeView === "programs") renderProgramWorkspace();
  else if (state.activeView === "settings") renderSettingsWorkspace();
  else renderPlaceholder(state.activeView);
}
function categoryOptions(selected, includeAll) {
  return getCategories().then(function (categories) {
    const lead = includeAll ? '<option value="">All categories</option>' : '<option value="">Choose a category</option>';
    return lead + categories.map(function (category) { return '<option value="' + escapeHtml(category) + '"' + (category === selected ? " selected" : "") + '>' + escapeHtml(category) + '</option>'; }).join("");
  });
}
async function renderHymnWorkspace() {
  if (state.hymnMode === "form") return renderHymnForm();
  return renderHymnList();
}
async function renderHymnList() {
  const content = document.getElementById("admin-content"); if (!content) return;
  content.replaceChildren();
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", "Hymns"), make("p", "", "Search and manage the bilingual hymn library."));
  const addButton = make("button", "button button-primary", ""); addButton.type = "button"; addButton.dataset.action = "new-hymn"; addButton.append(icon("plus", ""), document.createTextNode(" Add New Hymn"));
  heading.append(headingContent, addButton); content.append(heading);
  const controls = make("section", "hymn-toolbar");
  const left = make("div", "hymn-toolbar-left");
  const search = make("input", "hymn-search"); search.type = "search"; search.id = "hymn-search"; search.placeholder = "Search number, title, first line, category…"; search.setAttribute("aria-label", "Search hymns"); search.dataset.filter = "search"; search.value = state.search;
  left.append(search);
  const filters = make("div", "hymn-filters");
  const status = make("select", "filter-select"); status.setAttribute("aria-label", "Filter by publication status"); status.dataset.filter = "status";
  status.innerHTML = '<option value="">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option>'; status.value = state.statusFilter;
  const category = make("select", "filter-select"); category.setAttribute("aria-label", "Filter by category"); category.dataset.filter = "category"; category.innerHTML = await categoryOptions(state.categoryFilter, true);
  filters.append(status, category); controls.append(left, filters); content.append(controls);
  content.append(make("p", "hymn-results-label", "Loading hymns…"));
  const tableWrap = make("div", "hymn-table-wrap"); tableWrap.id = "hymn-table-wrap";
  tableWrap.innerHTML = '<table class="hymn-table"><thead><tr><th scope="col">Hymn</th><th scope="col">First line</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead><tbody id="hymn-table-body"></tbody></table>';
  content.append(tableWrap);
  await refreshHymnRows();
}
async function refreshHymnRows() {
  const content = document.getElementById("admin-content"); if (!content || state.activeView !== "hymns" || state.hymnMode !== "list") return;
  const hymns = await getHymns();
  const query = state.search.trim().toLowerCase();
  const matching = hymns.filter(function (hymn) {
    if (state.statusFilter && hymn.status !== state.statusFilter) return false;
    if (state.categoryFilter && hymn.category !== state.categoryFilter) return false;
    if (!query) return true;
    return [hymn.hymn_number, hymn.title_en, hymn.title_yoruba, hymn.first_line_en, hymn.first_line_yoruba, hymn.category].join(" ").toLowerCase().includes(query);
  });
  const label = root.querySelector(".hymn-results-label"); if (label) label.textContent = matching.length + (matching.length === 1 ? " hymn" : " hymns");
  const tableWrap = document.getElementById("hymn-table-wrap"); if (!tableWrap) return;
  if (!matching.length) {
    tableWrap.className = "list-empty";
    tableWrap.innerHTML = '<h2>No hymns match these filters</h2><p>Try a different search or clear the filters.</p><button class="button button-secondary" type="button" data-action="clear-hymn-filters">Clear filters</button>';
    return;
  }
  tableWrap.className = "hymn-table-wrap";
  tableWrap.innerHTML = '<table class="hymn-table"><thead><tr><th scope="col">Hymn</th><th scope="col">First line</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead><tbody>' + matching.map(function (hymn) {
    const updated = new Date(hymn.updated_at);
    const date = Number.isNaN(updated.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(updated);
    const firstLine = hymn.first_line_en || hymn.first_line_yoruba || "No first line yet";
    const statusClass = hymn.status === "published" ? "status-published" : "status-draft";
    const statusText = hymn.status === "published" ? "Published" : "Draft";
    const nextStatus = hymn.status === "published" ? "draft" : "published";
    const toggleLabel = nextStatus === "published" ? "Mark published" : "Save as draft";
    return '<tr><td><span class="hymn-row-title">' + escapeHtml(hymn.title_en || "Untitled hymn") + '</span><span class="hymn-row-subtitle">#' + escapeHtml(hymn.hymn_number) + (hymn.title_yoruba ? " · " + escapeHtml(hymn.title_yoruba) : "") + '</span></td><td>' + escapeHtml(firstLine) + '</td><td>' + escapeHtml(hymn.category || "—") + '</td><td><span class="status-pill ' + statusClass + '">' + statusText + '</span></td><td>' + date + '</td><td><div class="row-actions"><button class="row-action" type="button" data-action="edit-hymn" data-id="' + escapeHtml(hymn.id) + '" aria-label="Edit hymn ' + escapeHtml(hymn.hymn_number) + '">Edit</button><button class="row-action" type="button" data-action="set-status" data-id="' + escapeHtml(hymn.id) + '" data-status="' + nextStatus + '">' + toggleLabel + '</button><button class="row-action row-action-danger" type="button" data-action="delete-hymn" data-id="' + escapeHtml(hymn.id) + '" aria-label="Delete hymn ' + escapeHtml(hymn.hymn_number) + '">Delete</button></div></td></tr>';
  }).join("") + '</tbody></table>';
}
function toolbarMarkup(key, title) {
  const button = function (command, label, glyph) { return '<button type="button" data-editor-command="' + command + '" data-editor-target="' + key + '" aria-label="' + label + '" title="' + label + '">' + glyph + '</button>'; };
  return '<div class="editor-toolbar" role="toolbar" aria-label="' + title + ' formatting">' +
    '<select data-editor-command="fontName" data-editor-target="' + key + '" aria-label="Font family"><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Tahoma">Tahoma</option><option value="Verdana">Verdana</option><option value="Times New Roman">Times New Roman</option></select>' +
    '<select data-editor-command="fontSize" data-editor-target="' + key + '" aria-label="Font size"><option value="2">Small</option><option value="3" selected>Normal</option><option value="4">Large</option><option value="5">Larger</option><option value="6">Largest</option></select><span class="editor-separator" aria-hidden="true"></span>' +
    button("bold", "Bold", "<strong>B</strong>") + button("italic", "Italic", "<em>I</em>") + button("underline", "Underline", "<u>U</u>") + '<span class="editor-separator" aria-hidden="true"></span>' +
    button("justifyLeft", "Align left", "⇤") + button("justifyCenter", "Align center", "≡") + button("justifyRight", "Align right", "⇥") + '<span class="editor-separator" aria-hidden="true"></span>' +
    button("insertUnorderedList", "Bulleted list", "• List") + button("insertOrderedList", "Numbered list", "1. List") + button("indent", "Indent", "→") + button("outdent", "Outdent", "←") + '<span class="editor-separator" aria-hidden="true"></span>' +
    button("undo", "Undo", "↶") + button("redo", "Redo", "↷") + button("removeFormat", "Clear formatting", "Tx") +
    '</div>';
}
function editorMarkup(title, key, content, hint) {
  const safe = safeEditorContent(content);
  return '<section class="editor-card" data-editor-card="' + key + '"><header class="editor-card-header"><h3>' + title + '</h3><p>' + hint + '</p></header>' + toolbarMarkup(key, title) + '<div class="rich-editor-content" id="editor-' + key + '" data-rich-editor="' + key + '" contenteditable="true" role="textbox" aria-label="' + title + ' rich text editor" aria-multiline="true" data-placeholder="Start typing here…" spellcheck="true">' + safe + '</div></section>';
}
function currentFormData(status) {
  const field = function (id) { const element = document.getElementById(id); return element ? element.value.trim() : ""; };
  const bodyEnHtml = getEditorHtml("verses_en"); const bodyYoHtml = getEditorHtml("verses_yoruba");
  const chorusEnHtml = getEditorHtml("chorus_en"); const chorusYoHtml = getEditorHtml("chorus_yoruba");
  const chorusEn = plainTextFromHtml(chorusEnHtml); const chorusYo = plainTextFromHtml(chorusYoHtml);
  return {
    hymn_number: Number(field("hymn-number")), title_en: field("title-en"), title_yoruba: field("title-yoruba"),
    first_line_en: field("first-line-en"), first_line_yoruba: field("first-line-yoruba"), category: field("hymn-category"),
    verses_en: getEditorLines("verses_en"), verses_yoruba: getEditorLines("verses_yoruba"), chorus_en: chorusEn, chorus_yoruba: chorusYo,
    body_html_en: bodyEnHtml, body_html_yoruba: bodyYoHtml, chorus_html_en: chorusEnHtml, chorus_html_yoruba: chorusYoHtml,
    status: status || "draft"
  };
}
function formSignature() { return JSON.stringify(currentFormData("")); }
function isFormDirty() { return state.hymnMode === "form" && state.formStart !== null && formSignature() !== state.formStart; }
function isCategoryFormDirty() {
  const input = document.getElementById("category-name");
  return state.categoryMode === "form" && state.categoryFormStart !== null && input && input.value.trim() !== state.categoryFormStart;
}
function serviceFormSignature() {
  const form = document.getElementById("service-form"); if (!form) return null;
  const selected = Array.from(form.querySelectorAll('input[name="service_hymn_ids"]:checked')).map(function (input) { return input.value; }).sort();
  return JSON.stringify({ title: form.elements.service_title.value.trim(), date: form.elements.service_date.value, hymn_ids: selected });
}
function isServiceFormDirty() {
  const signature = serviceFormSignature();
  return state.serviceMode === "form" && state.serviceFormStart !== null && signature !== null && signature !== state.serviceFormStart;
}
function isSettingsFormDirty() {
  const select = document.getElementById("default-hymn-category");
  return state.activeView === "settings" && state.settingsFormStart !== null && select && select.value !== state.settingsFormStart;
}
function isQuoteSettingsFormDirty() {
  const signature = quoteSettingsFormSignature();
  return state.activeView === "settings" && state.quoteSettingsFormStart !== null && signature !== null && signature !== state.quoteSettingsFormStart;
}
function isProgramFormDirty() {
  const signature = programFormSignature();
  return state.programMode === "form" && state.programFormStart !== null && signature !== null && signature !== state.programFormStart;
}
function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyAdminTheme(theme) {
  const rootElement = document.documentElement;
  if (theme === "light" || theme === "dark") rootElement.setAttribute("data-admin-theme", theme);
  else rootElement.removeAttribute("data-admin-theme");
}
async function renderHymnForm() {
  const content = document.getElementById("admin-content"); if (!content) return;
  const existing = state.editingHymnId ? await getHymn(state.editingHymnId) : null;
  if (state.editingHymnId && !existing) { state.hymnMode = "list"; showToast("That hymn is no longer available."); return renderHymnList(); }
  const results = await Promise.all([getCategories(), getAdminSettings()]);
  const categories = results[0]; const settings = results[1];
  const hymn = existing || { hymn_number: "", title_en: "", title_yoruba: "", first_line_en: "", first_line_yoruba: "", category: "", verses_en: [], verses_yoruba: [], chorus_en: "", chorus_yoruba: "", body_html_en: "", body_html_yoruba: "", chorus_html_en: "", chorus_html_yoruba: "", status: "draft" };
  const defaultCategory = !existing && categories.includes(settings.defaultHymnCategory) ? settings.defaultHymnCategory : "";
  const selectedCategory = categories.indexOf(hymn.category) >= 0 ? hymn.category : defaultCategory;
  const categoryHtml = '<option value="">Choose a category</option>' + categories.map(function (category) { return '<option value="' + escapeHtml(category) + '"' + (category === selectedCategory ? " selected" : "") + '>' + escapeHtml(category) + '</option>'; }).join("");
  const englishBody = hymn.body_html_en || escapeLines(hymn.verses_en);
  const yorubaBody = hymn.body_html_yoruba || escapeLines(hymn.verses_yoruba);
  const englishChorus = hymn.chorus_html_en || (hymn.chorus_en ? "<p>" + escapeHtml(hymn.chorus_en) + "</p>" : "");
  const yorubaChorus = hymn.chorus_html_yoruba || (hymn.chorus_yoruba ? "<p>" + escapeHtml(hymn.chorus_yoruba) + "</p>" : "");
  content.innerHTML = '<div class="page-heading"><div><h1>' + (existing ? "Edit Hymn" : "Add New Hymn") + '</h1><p>' + (existing ? "Edit the hymn in the shared admin database." : "Create a hymn record. New hymns start as drafts unless you mark them published.") + '</p></div><button class="button button-secondary" type="button" data-action="cancel-hymn">Cancel</button></div>';
  const panel = make("section", "panel form-panel"); panel.setAttribute("aria-label", existing ? "Edit hymn form" : "Add hymn form");
  panel.innerHTML = '<form id="hymn-form" novalidate><h2 class="form-section-title">Hymn details</h2><p class="form-section-help">Hymn number, English title, category, and at least one opening line and verse are required. Yoruba text is optional.</p><div class="hymn-fields-grid"><div class="admin-field"><label for="hymn-number">Hymn number <span aria-hidden="true">*</span></label><input class="form-input" id="hymn-number" name="hymn_number" type="number" min="1" step="1" inputmode="numeric" value="' + escapeHtml(hymn.hymn_number) + '" required></div><div class="admin-field"><label for="hymn-category">Category <span aria-hidden="true">*</span></label><select class="form-select" id="hymn-category" name="category" required>' + categoryHtml + '</select></div><div class="admin-field"><label for="title-en">English hymn title <span aria-hidden="true">*</span></label><input class="form-input" id="title-en" name="title_en" maxlength="160" value="' + escapeHtml(hymn.title_en) + '" required></div><div class="admin-field"><label for="title-yoruba">Yoruba hymn title</label><input class="form-input" id="title-yoruba" name="title_yoruba" maxlength="160" value="' + escapeHtml(hymn.title_yoruba) + '"></div><div class="admin-field"><label for="first-line-en">English first line</label><input class="form-input" id="first-line-en" name="first_line_en" maxlength="240" value="' + escapeHtml(hymn.first_line_en) + '"></div><div class="admin-field"><label for="first-line-yoruba">Yoruba first line</label><input class="form-input" id="first-line-yoruba" name="first_line_yoruba" maxlength="240" value="' + escapeHtml(hymn.first_line_yoruba) + '"></div></div><div id="hymn-errors" class="form-errors" role="alert" aria-live="polite" hidden></div><section class="hymn-editor-section"><h2>English content</h2><p>Keep the chorus in its own editor; it is not merged into the verse body.</p><div class="rich-editor-grid">' + editorMarkup("English hymn body", "verses_en", englishBody, "Use one paragraph for each verse.") + editorMarkup("English chorus", "chorus_en", englishChorus, "This remains separate from the verses.") + '</div></section><section class="hymn-editor-section"><h2>Yoruba content</h2><p>Optional translation fields. Body and chorus remain separate.</p><div class="rich-editor-grid">' + editorMarkup("Yoruba hymn body", "verses_yoruba", yorubaBody, "Use one paragraph for each verse.") + editorMarkup("Yoruba chorus", "chorus_yoruba", yorubaChorus, "This remains separate from the verses.") + '</div></section><div class="form-actions"><div class="form-actions-left">' + (existing ? '<button class="button button-danger" type="button" data-action="delete-current">Delete Hymn</button>' : '') + '</div><div class="form-actions-right"><button class="button button-secondary" type="button" data-action="cancel-hymn">Cancel</button><button class="button button-secondary" type="submit" data-save-status="draft">Save as Draft</button><button class="button button-primary" type="submit" data-save-status="published">' + (existing && existing.status === "published" ? "Save Changes" : "Mark Published") + '</button></div></div></form>';
  content.append(panel);
  state.formStart = formSignature();
  const first = document.getElementById("hymn-number"); if (!existing && first) first.focus({ preventScroll: true });
}
function showFormErrors(errors) {
  const box = document.getElementById("hymn-errors"); if (!box) return;
  if (!errors.length) { box.hidden = true; box.replaceChildren(); return; }
  box.hidden = false; box.replaceChildren(make("strong", "", "Please correct the following:"));
  const list = document.createElement("ul"); errors.forEach(function (error) { list.append(make("li", "", error)); }); box.append(list);
}
function validateHymn(data, existingId) {
  const errors = [];
  if (!Number.isInteger(data.hymn_number) || data.hymn_number < 1) errors.push("Enter a whole hymn number greater than zero.");
  if (!data.title_en) errors.push("Enter the English hymn title.");
  if (!data.category) errors.push("Choose a category.");
  if (!data.first_line_en && !data.first_line_yoruba) errors.push("Enter at least one English or Yoruba first line.");
  if (!data.verses_en.length && !data.verses_yoruba.length) errors.push("Enter at least one verse in English or Yoruba.");
  if (data.title_en.length > 160 || data.title_yoruba.length > 160) errors.push("Titles must be 160 characters or fewer.");
  if (data.first_line_en.length > 240 || data.first_line_yoruba.length > 240) errors.push("First lines must be 240 characters or fewer.");
  return getHymns().then(function (hymns) {
    if (Number.isInteger(data.hymn_number) && hymns.some(function (hymn) { return hymn.id !== existingId && Number(hymn.hymn_number) === data.hymn_number; })) errors.push("That hymn number is already in use. Choose a different number.");
    return errors;
  });
}
async function saveHymnForm(status) {
  const data = currentFormData(status); const errors = await validateHymn(data, state.editingHymnId);
  if (errors.length) {
    showFormErrors(errors);
    const focusId = !Number.isInteger(data.hymn_number) || data.hymn_number < 1 ? "hymn-number" : (!data.title_en ? "title-en" : (!data.category ? "hymn-category" : null));
    if (focusId) document.getElementById(focusId).focus(); else document.getElementById("hymn-errors").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  try {
    const saved = state.editingHymnId
      ? await updateHymn(state.editingHymnId, data)
      : await createHymn(data);
    const mode = saved._storage_mode || getStorageMode();
    const actionLabel = status === "published" ? "marked published" : "saved as a draft";
    state.hymnMode = "list"; state.editingHymnId = null; state.formStart = null;
    await renderHymnList();
    showToast(mode === "browser" ? "Hymn " + actionLabel + " in this browser's demo data only; the public hymnal is unchanged." : "Saved for this open session only; browser storage is unavailable.");
  } catch (error) {
    showFormErrors([error && error.message ? error.message : "The hymn could not be saved."]);
  }
}
async function cancelHymnForm() {
  if (isFormDirty() && !window.confirm("Discard your unsaved hymn changes?")) return false;
  state.hymnMode = "list"; state.editingHymnId = null; state.formStart = null; await renderHymnList(); return true;
}
async function confirmDeleteHymn(hymn) {
  if (!hymn) return;
  const dialog = document.createElement("dialog"); dialog.className = "confirm-dialog"; dialog.setAttribute("aria-labelledby", "delete-hymn-title");
  const inner = make("div", "confirm-dialog-inner");
  inner.append(make("h2", "", "Are you sure you want to delete this hymn?"));
  const details = document.createElement("p"); details.append(document.createTextNode("You are deleting "), make("strong", "", "Hymn #" + hymn.hymn_number + " — " + hymn.title_en), document.createTextNode(" from the admin database. This does not change the public hymnal."));
  const actions = make("div", "confirm-dialog-actions");
  const cancel = make("button", "button button-secondary", "Cancel"); cancel.type = "button";
  const remove = make("button", "button button-danger", "Delete"); remove.type = "button";
  actions.append(cancel, remove); inner.append(details, actions); dialog.append(inner); root.append(dialog);
  cancel.addEventListener("click", function () { dialog.close(); });
  remove.addEventListener("click", async function () {
    remove.disabled = true;
    try {
      await deleteHymn(hymn.id); const mode = getStorageMode(); dialog.close();
      state.hymnMode = "list"; state.editingHymnId = null; state.formStart = null;
      if (state.activeView === "hymns") await renderHymnList(); else renderDashboard();
      showToast(mode === "browser" ? "Hymn #" + hymn.hymn_number + " deleted from this browser's demo data." : "Hymn #" + hymn.hymn_number + " deleted for this open session only.");
    } catch (error) { remove.disabled = false; showToast(error.message || "The hymn could not be deleted."); }
  });
  dialog.addEventListener("close", function () { dialog.remove(); });
  dialog.showModal(); cancel.focus();
}
async function setHymnStatus(id, status) {
  try {
    const saved = status === "published" ? await publishHymn(id) : await saveHymnAsDraft(id);
    const mode = saved._storage_mode || getStorageMode();
    await refreshHymnRows();
    showToast(mode === "browser"
      ? (status === "published" ? "Marked published in this browser's demo data only." : "Saved as a draft in this browser's demo data only.")
      : "Status changed for this open session only; browser storage is unavailable.");
  } catch (error) { showToast(error.message || "The status could not be changed."); }
}

root.addEventListener("click", async function (event) {
  const button = event.target.closest("[data-action]"); if (!button) return;
  const action = button.dataset.action;
  if (action === "toggle-password") {
    const input = document.getElementById("admin-password"); if (!input) return;
    const show = input.type === "password"; input.type = show ? "text" : "password"; button.textContent = show ? "Hide" : "Show"; button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  } else if (action === "navigate") {
    if (isFormDirty() && !window.confirm("Discard your unsaved hymn changes?")) return;
    if (isCategoryFormDirty() && !window.confirm("Discard your unsaved category changes?")) return;
    if (isServiceFormDirty() && !window.confirm("Discard your unsaved service plan changes?")) return;
    if (isProgramFormDirty() && !window.confirm("Discard your unsaved program changes?")) return;
    if (isSettingsFormDirty() && !window.confirm("Discard your unsaved workspace preference?")) return;
    if (isQuoteSettingsFormDirty() && !window.confirm("Discard your unsaved quote settings?")) return;
    state.formStart = null; state.categoryFormStart = null; state.categoryMode = "list"; state.editingCategoryName = null; state.serviceFormStart = null; state.serviceMode = "list"; state.editingServiceId = null; state.programFormStart = null; state.programMode = "list"; state.editingProgramId = null; state.programFlyerUrl = ""; state.settingsFormStart = null; state.quoteSettingsFormStart = null; state.hymnMode = "list"; state.editingHymnId = null; state.activeView = button.dataset.view || "dashboard"; closeMenu(); renderCurrentView();
    const content = document.getElementById("admin-content"); if (content) content.focus({ preventScroll: true });
  } else if (action === "open-hymns") {
    state.activeView = "hymns"; state.hymnMode = "list"; closeMenu(); renderCurrentView();
  } else if (action === "new-hymn") {
    state.activeView = "hymns"; state.hymnMode = "form"; state.editingHymnId = null; closeMenu(); renderCurrentView();
  } else if (action === "edit-hymn") {
    state.activeView = "hymns"; state.hymnMode = "form"; state.editingHymnId = button.dataset.id; closeMenu(); renderCurrentView();
  } else if (action === "cancel-hymn") {
    await cancelHymnForm();
  } else if (action === "delete-hymn") {
    const hymn = await getHymn(button.dataset.id); await confirmDeleteHymn(hymn);
  } else if (action === "delete-current") {
    const hymn = await getHymn(state.editingHymnId); await confirmDeleteHymn(hymn);
  } else if (action === "set-status") {
    await setHymnStatus(button.dataset.id, button.dataset.status);
  } else if (action === "clear-hymn-filters") {
    state.search = ""; state.statusFilter = ""; state.categoryFilter = ""; await renderHymnList();
  } else if (action === "new-category") {
    state.activeView = "categories"; state.categoryMode = "form"; state.editingCategoryName = null; closeMenu(); renderCurrentView();
  } else if (action === "edit-category") {
    state.activeView = "categories"; state.categoryMode = "form"; state.editingCategoryName = button.dataset.name; closeMenu(); renderCurrentView();
  } else if (action === "cancel-category") {
    await cancelCategoryForm();
  } else if (action === "delete-category") {
    await removeCategoryFromPreview(button.dataset.name);
  } else if (action === "new-service") {
    state.activeView = "services"; state.serviceMode = "form"; state.editingServiceId = null; closeMenu(); renderCurrentView();
  } else if (action === "edit-service") {
    state.activeView = "services"; state.serviceMode = "form"; state.editingServiceId = button.dataset.id; closeMenu(); renderCurrentView();
  } else if (action === "cancel-service") {
    await cancelServiceForm();
  } else if (action === "delete-service") {
    await removeServiceFromPreview(button.dataset.id);
  } else if (action === "new-program") {
    state.activeView = "programs"; state.programMode = "form"; state.editingProgramId = null; state.programFlyerUrl = ""; closeMenu(); renderCurrentView();
  } else if (action === "edit-program") {
    state.activeView = "programs"; state.programMode = "form"; state.editingProgramId = button.dataset.id; closeMenu(); renderCurrentView();
  } else if (action === "cancel-program") {
    await cancelProgramForm();
  } else if (action === "delete-program") {
    await removeProgramFromPreview(button.dataset.id || state.editingProgramId);
  } else if (action === "remove-program-flyer") {
    state.programFlyerUrl = "";
    const input = document.getElementById("program-flyer-input"); if (input) input.value = "";
    updateProgramFlyerPreview("");
  } else if (action === "toggle-admin-theme") {
    const current = await getAdminSettings();
    const active = current.defaultTheme === "system" ? getSystemTheme() : current.defaultTheme;
    const next = active === "dark" ? "light" : "dark";
    const mode = await updateAdminSettings({ defaultTheme: next }); applyAdminTheme(next); await renderSettingsWorkspace();
    showToast(mode === "browser" ? (next === "dark" ? "Dark theme saved as the admin default." : "Light theme saved as the admin default.") : "Theme updated for this session; browser storage is unavailable.");
  } else if (action === "use-system-theme") {
    const mode = await updateAdminSettings({ defaultTheme: "system" }); applyAdminTheme("system"); await renderSettingsWorkspace();
    showToast(mode === "browser" ? "Admin theme now follows this device." : "Device theme applied for this session; browser storage is unavailable.");
  } else if (action === "toggle-menu") {
    state.menuOpen = !state.menuOpen;
    const sidebar = document.getElementById("admin-sidebar"); const toggle = root.querySelector('[data-action="toggle-menu"]'); const backdrop = root.querySelector(".sidebar-backdrop");
    if (sidebar) sidebar.classList.toggle("is-open", state.menuOpen); if (toggle) toggle.setAttribute("aria-expanded", String(state.menuOpen)); if (backdrop) backdrop.hidden = !state.menuOpen;
  } else if (action === "close-menu") {
    closeMenu();
  } else if (action === "logout") {
    if (isFormDirty() && !window.confirm("Discard your unsaved hymn changes and sign out?")) return;
    if (isCategoryFormDirty() && !window.confirm("Discard your unsaved category changes and sign out?")) return;
    if (isServiceFormDirty() && !window.confirm("Discard your unsaved service plan changes and sign out?")) return;
    if (isProgramFormDirty() && !window.confirm("Discard your unsaved program changes and sign out?")) return;
    if (isSettingsFormDirty() && !window.confirm("Discard your unsaved workspace preference and sign out?")) return;
    if (isQuoteSettingsFormDirty() && !window.confirm("Discard your unsaved quote settings and sign out?")) return;
    await logoutAdmin(); state.authStatus = { configured: true, authenticated: false, admin: null }; state.formStart = null; state.categoryFormStart = null; state.serviceFormStart = null; state.programFormStart = null; state.programFlyerUrl = ""; state.quoteSettingsFormStart = null; state.settingsFormStart = null; renderLogin();
  }
});

root.addEventListener("submit", async function (event) {
  if (event.target.id === "admin-login-form") {
    event.preventDefault(); const email = document.getElementById("admin-email"); const password = document.getElementById("admin-password");
    const feedback = document.getElementById("login-error"); const submit = document.getElementById("login-submit"); const label = submit.querySelector(".login-button-label");
    feedback.textContent = "";
    if (!email.value.trim() || !email.validity.valid || !password.value) { feedback.textContent = "Enter a valid email address and password to continue."; (!email.value.trim() || !email.validity.valid ? email : password).focus(); return; }
    submit.disabled = true; submit.setAttribute("aria-busy", "true"); label.textContent = "Checking…";
     try {
       const admin = await loginAdmin(email.value.trim(), password.value);
       password.value = "";
       const importResult = await initializeAdminData();
       state.authStatus = { configured: true, authenticated: true, admin: admin };
       state.activeView = "dashboard";
       renderShell();
       if (importResult.imported) showToast(importResult.imported + " existing hymns imported to the shared admin database.");
     }
     catch (error) { feedback.textContent = error && error.message ? error.message : "Admin sign-in failed."; }
    finally { submit.disabled = false; submit.removeAttribute("aria-busy"); label.textContent = "Sign in"; }
  } else if (event.target.id === "category-form") {
    event.preventDefault(); await saveCategoryForm(event.submitter);
  } else if (event.target.id === "settings-form") {
    event.preventDefault(); await saveSettingsForm();
  } else if (event.target.id === "daily-quote-form") {
    event.preventDefault(); await saveDailyQuoteSettings();
  } else if (event.target.id === "service-form") {
    event.preventDefault(); await saveServiceForm(event.submitter);
  } else if (event.target.id === "program-form") {
    event.preventDefault(); await saveProgramForm(event.submitter);
  } else if (event.target.id === "hymn-form") {
    event.preventDefault(); const submitter = event.submitter; await saveHymnForm(submitter && submitter.dataset.saveStatus === "published" ? "published" : "draft");
  }
});
root.addEventListener("input", function (event) {
  if (event.target.matches('[data-filter="search"]')) { state.search = event.target.value; refreshHymnRows(); }
  if (event.target.closest("#hymn-form")) state.formDirty = isFormDirty();
  if (event.target.matches("[data-rich-editor]")) rememberEditorSelection(event.target.dataset.richEditor);
});
root.addEventListener("change", function (event) {
  if (event.target.matches('[data-filter="status"]')) { state.statusFilter = event.target.value; refreshHymnRows(); }
  if (event.target.matches('[data-filter="category"]')) { state.categoryFilter = event.target.value; refreshHymnRows(); }
  if (event.target.matches("[data-editor-command]")) runEditorCommand(event.target.dataset.editorTarget, event.target.dataset.editorCommand, event.target.value);
  if (event.target.matches('input[name="service_hymn_ids"]')) updateServiceHymnCount();
  if (event.target.id === "program-flyer-input") {
    const file = event.target.files && event.target.files[0]; const feedback = document.getElementById("program-flyer-error");
    if (!file) return;
    if (feedback) feedback.textContent = "Preparing full flyer preview…";
    optimizeProgramFlyer(file).then(function (dataUrl) {
      state.programFlyerUrl = dataUrl; updateProgramFlyerPreview(dataUrl);
      if (feedback) feedback.textContent = "";
    }).catch(function (error) {
      event.target.value = ""; if (feedback) feedback.textContent = error && error.message ? error.message : "The flyer could not be loaded.";
    });
  }
});
function rememberEditorSelection(key) {
  const editor = root.querySelector('[data-rich-editor="' + key + '"]'); const selection = window.getSelection();
  if (!editor || !selection || !selection.rangeCount || !editor.contains(selection.anchorNode)) return;
  editor.dataset.savedRange = "true"; editor._savedRange = selection.getRangeAt(0).cloneRange();
}
function restoreEditorSelection(editor) {
  if (!editor) return;
  editor.focus();
  if (editor._savedRange) { const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(editor._savedRange); }
}
function runEditorCommand(key, command, value) {
  const editor = root.querySelector('[data-rich-editor="' + key + '"]'); if (!editor) return;
  restoreEditorSelection(editor);
  const val = command === "fontSize" ? String(value || "3") : (value || null);
  document.execCommand(command, false, val);
  rememberEditorSelection(key); state.formDirty = isFormDirty();
}
root.addEventListener("mousedown", function (event) {
  if (event.target.closest(".editor-toolbar button")) event.preventDefault();
});
root.addEventListener("keyup", function (event) { if (event.target.matches("[data-rich-editor]")) rememberEditorSelection(event.target.dataset.richEditor); });
root.addEventListener("mouseup", function (event) { if (event.target.matches("[data-rich-editor]")) rememberEditorSelection(event.target.dataset.richEditor); });
root.addEventListener("focusout", function (event) { if (event.target.matches("[data-rich-editor]")) rememberEditorSelection(event.target.dataset.richEditor); });
root.addEventListener("paste", function (event) {
  const editor = event.target.closest("[data-rich-editor]"); if (!editor) return;
  event.preventDefault();
  const clipboard = event.clipboardData; const incoming = clipboard && clipboard.getData("text/html");
  const clean = incoming ? sanitizeRichHtml(incoming) : escapeHtml(clipboard ? clipboard.getData("text/plain") : "").replace(/\r?\n/g, "<br>");
  restoreEditorSelection(editor); document.execCommand("insertHTML", false, clean); rememberEditorSelection(editor.dataset.richEditor); state.formDirty = isFormDirty();
});
window.addEventListener("beforeunload", function (event) {
  if (isFormDirty() || isSettingsFormDirty() || isQuoteSettingsFormDirty() || isProgramFormDirty()) { event.preventDefault(); event.returnValue = ""; }
});

renderLogin();
initializeAdminAuth().then(async function (result) {
  state.authStatus = result;
  if (!result.authenticated) return;
  try {
    const importResult = await initializeAdminData();
    state.activeView = "dashboard";
    renderShell();
    if (importResult.imported) showToast(importResult.imported + " existing hymns imported to the shared admin database.");
  } catch (error) {
    state.authStatus = { configured: true, authenticated: false, admin: null };
    await logoutAdmin();
    renderLogin();
    const feedback = document.getElementById("login-error");
    if (feedback) feedback.textContent = error && error.message ? error.message : "The admin workspace could not connect to Supabase.";
  }
}).catch(function () {
  state.authStatus = null;
  renderLogin();
});

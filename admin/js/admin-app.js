import { initializeAdminAuth, loginAdmin, logoutAdmin } from "./admin-auth.js";
import { createHymn, deleteHymn, getCategories, getDashboardStats, getDraftHymns, getHymn, getHymns, getPublishedHymns, getRecentlyUpdatedHymns, getStorageMode, publishHymn, saveHymnAsDraft, updateHymn } from "./admin-data.js?v=2b";

const root = document.getElementById("admin-root");
const state = { view: "login", activeView: "dashboard", menuOpen: false, authStatus: null, hymnMode: "list", editingHymnId: null, search: "", statusFilter: "", categoryFilter: "", formStart: null, toastTimer: null };
const navigation = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "hymns", label: "Hymns", icon: "book" },
  { id: "categories", label: "Categories", icon: "layers" },
  { id: "services", label: "Service Planner", icon: "calendar" },
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
  root.innerHTML = '<main class="login-layout"><section class="login-brand-panel" aria-label="Church hymnal administration"><div class="brand-lockup"><img src="../assets/demo-church-mark.svg" alt="" width="52" height="52"><span>Consolation Hymnal<br>Administration</span></div><div class="brand-copy"><p class="eyebrow">ADMIN WORKSPACE</p><h1>Care for the hymns that bring us together.</h1><p>A separate workspace for authorised church administrators. The member hymnal remains open to everyone, without an account.</p></div><p class="brand-panel-foot">Consolation Evangelical and Revival Church · “Occupy Till I Come”</p></section><section class="login-side"><div class="login-card"><img class="login-card-mark" src="../assets/demo-church-mark.svg" alt=""><p class="eyebrow" style="color:var(--purple)">ADMIN SIGN IN</p><h2>Welcome back</h2><p class="login-intro">Sign-in is not connected in this foundation phase. The form below is interface-only; credentials are not checked, sent, or saved.</p><div class="notice"><span class="notice-mark" aria-hidden="true">i</span><span>Real administrator access will be added with Supabase Auth and database authorization in a later phase.</span></div><form id="admin-login-form" novalidate><div class="field"><label for="admin-email">Email address</label><input id="admin-email" name="email" type="email" inputmode="email" autocomplete="username" placeholder="name@church.org" required></div><div class="field"><label for="admin-password">Password</label><div class="password-wrap"><input id="admin-password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required><button class="password-toggle" type="button" data-action="toggle-password" aria-controls="admin-password" aria-label="Show password">Show</button></div></div><p class="form-error" id="login-error" role="alert" aria-live="polite"></p><button class="button button-primary button-wide" id="login-submit" type="submit"><span class="login-button-label">Sign in</span></button></form><button class="button button-quiet" type="button" data-action="preview">Preview dashboard with demo data</button><p class="login-foot">Demo preview can edit a browser-only copy; it is not an authenticated admin session.</p><a class="public-link" href="../">← Open the public hymnal</a></div></section></main>';
}
function renderShell() {
  const navMarkup = navigation.map(function (item) {
    return '<button class="nav-item" type="button" data-action="navigate" data-view="' + item.id + '" aria-current="' + (state.activeView === item.id ? "page" : "false") + '"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + iconPaths[item.icon] + '</svg></span><span>' + item.label + '</span></button>';
  }).join("");
  root.innerHTML = '<div class="admin-shell"><aside class="sidebar" id="admin-sidebar"><div class="sidebar-brand"><img src="../assets/demo-church-mark.svg" alt=""><div><strong>Consolation Hymnal</strong><span>Admin workspace</span></div></div><p class="sidebar-label">Workspace</p><nav class="sidebar-nav" aria-label="Admin sections">' + navMarkup + '</nav><div class="sidebar-bottom"><button class="nav-item" type="button" data-action="logout"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg></span><span>Exit preview</span></button><a class="sidebar-public-link" href="../">View public hymnal ↗</a></div></aside><button class="sidebar-backdrop" type="button" data-action="close-menu" aria-label="Close navigation" hidden></button><main class="admin-main"><header class="topbar"><div class="topbar-left"><button class="mobile-menu-button" type="button" data-action="toggle-menu" aria-label="Open admin navigation" aria-expanded="false" aria-controls="admin-sidebar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><div><p class="topbar-kicker">Consolation Evangelical and Revival Church</p><p class="topbar-title">Admin workspace</p></div></div><div class="topbar-right"><span class="preview-chip"><span class="preview-dot" aria-hidden="true"></span>Demo preview</span><span class="admin-avatar" aria-label="Demo administrator preview">D</span></div></header><div class="content-wrap" id="admin-content" tabindex="-1"></div><div class="app-toast" id="admin-toast" role="status" aria-live="polite" hidden></div></main></div>';
  renderCurrentView();
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
  toast.textContent = message; toast.hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(function () { toast.hidden = true; }, 4200);
}
function previewBanner() {
  const banner = make("section", "preview-banner");
  banner.setAttribute("aria-label", "Demo preview notice");
  const mark = make("span", "notice-mark", "!"); mark.setAttribute("aria-hidden", "true");
  const copy = document.createElement("div");
  copy.append(make("strong", "", "Demo preview · this browser only"), make("p", "", "Hymn edits are stored only in this browser. Nothing is sent to a server, published to the public hymnal, or protected by real admin sign-in."));
  banner.append(mark, copy); return banner;
}
function renderDashboard() {
  const content = document.getElementById("admin-content");
  content.replaceChildren();
  const heading = make("div", "page-heading");
  const titleBox = document.createElement("div");
  titleBox.append(make("h1", "", "Dashboard"), make("p", "", "A simple overview of the hymnal admin workspace."));
  heading.append(titleBox); content.append(heading, previewBanner());
  getDashboardStats().then(function (stats) {
    if (!document.getElementById("admin-content")) return;
    const cards = [
      ["Total Hymns", stats.totalHymns, "Local demo records", "book"], ["Published Hymns", stats.publishedHymns, "Demo status only", "check"],
      ["Draft Hymns", stats.draftHymns, "Demo status only", "clock"], ["English Hymns", stats.englishHymns, "Sample records", "language"],
      ["Yoruba Hymns", stats.yorubaHymns, "Sample records", "language"], ["Categories", stats.categories, "Preview categories", "layers"],
      ["Upcoming Service Plans", stats.upcomingServicePlans, "Demo references", "calendar"]
    ];
    const grid = make("section", "stats-grid"); grid.setAttribute("aria-label", "Demo statistics");
    cards.forEach(function (item) {
      const card = make("article", "stat-card");
      const top = make("div", "stat-head"); top.append(make("span", "stat-label", item[0]), icon(item[3], "stat-icon"));
      card.append(top, make("p", "stat-value", String(item[1])), make("p", "stat-hint", item[2])); grid.append(card);
    });
    content.append(grid);
    const lower = make("div", "dashboard-lower");
    const recentPanel = make("section", "panel");
    const recentHeader = make("header", "panel-header"); const recentTitle = document.createElement("div");
    recentTitle.append(make("h2", "", "Recently Updated Hymns"), make("p", "", "Example records from your local preview.")); recentHeader.append(recentTitle); recentPanel.append(recentHeader);
    const body = make("div", "panel-body"); const tableWrap = make("div", "table-wrap"); const table = make("table", "recent-table");
    table.innerHTML = '<thead><tr><th scope="col">Hymn</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector("tbody");
    getRecentlyUpdatedHymns(5).then(function (hymns) {
      hymns.forEach(function (hymn) {
        const row = document.createElement("tr"); const cell = document.createElement("td");
        cell.append(make("span", "hymn-name", hymn.title_en), make("span", "hymn-number", "Demo #" + String(hymn.hymn_number).padStart(2, "0")));
        const statusCell = document.createElement("td"); statusCell.append(make("span", "status-pill " + (hymn.status === "published" ? "status-published" : "status-draft"), hymn.status === "published" ? "Published" : "Draft"));
        const dateCell = document.createElement("td"); const date = new Date(hymn.updated_at);
        dateCell.textContent = Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
        row.append(cell, statusCell, dateCell); tbody.append(row);
      });
    }).catch(function () { tbody.innerHTML = '<tr><td colspan="3">Demo data is unavailable.</td></tr>'; });
    tableWrap.append(table); body.append(tableWrap, make("p", "demo-caption", "Sample placeholders only; these are not live church records.")); recentPanel.append(body);
    const actionsPanel = make("section", "panel"); const actionsHeader = make("header", "panel-header"); const actionsTitle = document.createElement("div");
    actionsTitle.append(make("h2", "", "Quick Actions"), make("p", "", "Shortcuts for hymnal management.")); actionsHeader.append(actionsTitle); actionsPanel.append(actionsHeader);
    const actionsBody = make("div", "panel-body"); const actions = [["Add New Hymn", "plus", "new-hymn"], ["Manage Hymns", "book", "open-hymns"], ["Manage Categories", "layers", "navigate", "categories"], ["Create Service Plan", "calendar", "navigate", "services"]];
    const list = make("div", "quick-actions");
    actions.forEach(function (item) {
      const button = make("button", "quick-action", ""); button.type = "button"; button.dataset.action = item[2];
      if (item[3]) button.dataset.view = item[3];
      button.append(icon(item[1], "quick-action-icon"), make("span", "", item[0]), make("span", "quick-arrow", "›")); list.append(button);
    });
    actionsBody.append(list, make("p", "demo-caption", "Hymn management is available in this browser preview. Other sections remain placeholders.")); actionsPanel.append(actionsBody);
    lower.append(recentPanel, actionsPanel); content.append(lower);
  }).catch(function () { content.append(make("section", "list-empty", "Dashboard preview data could not be loaded.")); });
}
function renderPlaceholder(view) {
  const content = document.getElementById("admin-content"); content.replaceChildren();
  const item = navigation.find(function (entry) { return entry.id === view; }); const title = item ? item.label : "Dashboard";
  const heading = make("div", "page-heading"); const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", title), make("p", "", "This section is reserved for a later phase.")); heading.append(headingContent); content.append(heading, previewBanner());
  const card = make("section", "placeholder-card"); const inner = make("div", "placeholder-inner");
  inner.append(icon(item ? item.icon : "grid", "placeholder-icon"), make("h2", "", "Coming in the next phase"), make("p", "", "Phase 2B adds hymn management only. Category management, service planning, and settings remain separate future work."));
  const back = make("button", "button button-secondary", "Back to dashboard"); back.type = "button"; back.dataset.action = "navigate"; back.dataset.view = "dashboard";
  inner.append(back); card.append(inner); content.append(card);
}
function renderCurrentView() {
  root.querySelectorAll(".nav-item[data-view]").forEach(function (button) { button.setAttribute("aria-current", button.dataset.view === state.activeView ? "page" : "false"); });
  if (state.activeView === "dashboard") renderDashboard();
  else if (state.activeView === "hymns") renderHymnWorkspace();
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
  headingContent.append(make("h1", "", "Hymns"), make("p", "", "Search and manage the bilingual demo hymn library."));
  const addButton = make("button", "button button-primary", ""); addButton.type = "button"; addButton.dataset.action = "new-hymn"; addButton.append(icon("plus", ""), document.createTextNode(" Add New Hymn"));
  heading.append(headingContent, addButton); content.append(heading, previewBanner());
  const controls = make("section", "hymn-toolbar");
  const left = make("div", "hymn-toolbar-left");
  const search = make("input", "hymn-search"); search.type = "search"; search.id = "hymn-search"; search.placeholder = "Search number, title, first line, category…"; search.setAttribute("aria-label", "Search hymns"); search.dataset.filter = "search"; search.value = state.search;
  left.append(search);
  const filters = make("div", "hymn-filters");
  const status = make("select", "filter-select"); status.setAttribute("aria-label", "Filter by publication status"); status.dataset.filter = "status";
  status.innerHTML = '<option value="">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option>'; status.value = state.statusFilter;
  const category = make("select", "filter-select"); category.setAttribute("aria-label", "Filter by category"); category.dataset.filter = "category"; category.innerHTML = await categoryOptions(state.categoryFilter, true);
  filters.append(status, category); controls.append(left, filters); content.append(controls);
  content.append(make("p", "hymn-results-label", "Loading demo hymns…"));
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
  const label = root.querySelector(".hymn-results-label"); if (label) label.textContent = matching.length + (matching.length === 1 ? " demo hymn" : " demo hymns");
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
async function renderHymnForm() {
  const content = document.getElementById("admin-content"); if (!content) return;
  const existing = state.editingHymnId ? await getHymn(state.editingHymnId) : null;
  if (state.editingHymnId && !existing) { state.hymnMode = "list"; showToast("That demo hymn is no longer available."); return renderHymnList(); }
  const categories = await getCategories();
  const hymn = existing || { hymn_number: "", title_en: "", title_yoruba: "", first_line_en: "", first_line_yoruba: "", category: "", verses_en: [], verses_yoruba: [], chorus_en: "", chorus_yoruba: "", body_html_en: "", body_html_yoruba: "", chorus_html_en: "", chorus_html_yoruba: "", status: "draft" };
  const selectedCategory = categories.indexOf(hymn.category) >= 0 ? hymn.category : "";
  const categoryHtml = '<option value="">Choose a category</option>' + categories.map(function (category) { return '<option value="' + escapeHtml(category) + '"' + (category === selectedCategory ? " selected" : "") + '>' + escapeHtml(category) + '</option>'; }).join("");
  const englishBody = hymn.body_html_en || escapeLines(hymn.verses_en);
  const yorubaBody = hymn.body_html_yoruba || escapeLines(hymn.verses_yoruba);
  const englishChorus = hymn.chorus_html_en || (hymn.chorus_en ? "<p>" + escapeHtml(hymn.chorus_en) + "</p>" : "");
  const yorubaChorus = hymn.chorus_html_yoruba || (hymn.chorus_yoruba ? "<p>" + escapeHtml(hymn.chorus_yoruba) + "</p>" : "");
  content.innerHTML = '<div class="page-heading"><div><h1>' + (existing ? "Edit Hymn" : "Add New Hymn") + '</h1><p>' + (existing ? "Edit the demo record and choose whether to keep it as a draft or mark it published." : "Create a local demo record. New hymns start as drafts unless you publish the preview status.") + '</p></div><button class="button button-secondary" type="button" data-action="cancel-hymn">Cancel</button></div>';
  content.append(previewBanner());
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
  const details = document.createElement("p"); details.append(document.createTextNode("You are deleting "), make("strong", "", "Hymn #" + hymn.hymn_number + " — " + hymn.title_en), document.createTextNode(" from this browser's demo data. This does not change the public hymnal."));
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
  } else if (action === "preview") {
    state.view = "preview"; state.activeView = "dashboard"; closeMenu(); renderShell();
  } else if (action === "navigate") {
    if (isFormDirty() && !window.confirm("Discard your unsaved hymn changes?")) return;
    state.formStart = null; state.hymnMode = "list"; state.editingHymnId = null; state.activeView = button.dataset.view || "dashboard"; closeMenu(); renderCurrentView();
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
  } else if (action === "toggle-menu") {
    state.menuOpen = !state.menuOpen;
    const sidebar = document.getElementById("admin-sidebar"); const toggle = root.querySelector('[data-action="toggle-menu"]'); const backdrop = root.querySelector(".sidebar-backdrop");
    if (sidebar) sidebar.classList.toggle("is-open", state.menuOpen); if (toggle) toggle.setAttribute("aria-expanded", String(state.menuOpen)); if (backdrop) backdrop.hidden = !state.menuOpen;
  } else if (action === "close-menu") {
    closeMenu();
  } else if (action === "logout") {
    if (isFormDirty() && !window.confirm("Discard your unsaved hymn changes and exit the preview?")) return;
    await logoutAdmin(); state.formStart = null; renderLogin();
  }
});

root.addEventListener("submit", async function (event) {
  if (event.target.id === "admin-login-form") {
    event.preventDefault(); const email = document.getElementById("admin-email"); const password = document.getElementById("admin-password");
    const feedback = document.getElementById("login-error"); const submit = document.getElementById("login-submit"); const label = submit.querySelector(".login-button-label");
    feedback.textContent = "";
    if (!email.value.trim() || !email.validity.valid || !password.value) { feedback.textContent = "Enter a valid email address and password to continue."; (!email.value.trim() || !email.validity.valid ? email : password).focus(); return; }
    submit.disabled = true; submit.setAttribute("aria-busy", "true"); label.textContent = "Checking…";
    try { await loginAdmin(email.value.trim(), password.value); }
    catch (error) { feedback.textContent = error && error.message ? error.message : "Sign-in is not available in this phase."; }
    finally { submit.disabled = false; submit.removeAttribute("aria-busy"); label.textContent = "Sign in"; }
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
  if (isFormDirty()) { event.preventDefault(); event.returnValue = ""; }
});

initializeAdminAuth().then(function (result) { state.authStatus = result; }).catch(function () { state.authStatus = null; });
renderLogin();

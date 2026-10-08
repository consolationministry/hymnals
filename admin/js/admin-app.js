import { initializeAdminAuth, loginAdmin, logoutAdmin } from "./admin-auth.js";
import { getDashboardStats, getRecentlyUpdatedHymns } from "./admin-data.js";

const root = document.getElementById("admin-root");
const state = { view: "login", activeView: "dashboard", menuOpen: false, authStatus: null };
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
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'
};

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

function renderLogin() {
  root.innerHTML = '<main class="login-layout"><section class="login-brand-panel" aria-label="Church hymnal administration"><div class="brand-lockup"><img src="../assets/demo-church-mark.svg" alt="" width="52" height="52"><span>Consolation Hymnal<br>Administration</span></div><div class="brand-copy"><p class="eyebrow">ADMIN WORKSPACE</p><h1>Care for the hymns that bring us together.</h1><p>A separate workspace for authorised church administrators. The member hymnal remains open to everyone, without an account.</p></div><p class="brand-panel-foot">Consolation Evangelical and Revival Church · “Occupy Till I Come”</p></section><section class="login-side"><div class="login-card"><img class="login-card-mark" src="../assets/demo-church-mark.svg" alt=""><p class="eyebrow" style="color:var(--purple)">ADMIN SIGN IN</p><h2>Welcome back</h2><p class="login-intro">Sign-in is not connected in this foundation phase. The form below is interface-only; credentials are not checked, sent, or saved.</p><div class="notice"><span class="notice-mark" aria-hidden="true">i</span><span>Real administrator access will be added with Supabase Auth and database authorization in a later phase.</span></div><form id="admin-login-form" novalidate><div class="field"><label for="admin-email">Email address</label><input id="admin-email" name="email" type="email" inputmode="email" autocomplete="username" placeholder="name@church.org" required></div><div class="field"><label for="admin-password">Password</label><div class="password-wrap"><input id="admin-password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required><button class="password-toggle" type="button" data-action="toggle-password" aria-controls="admin-password" aria-label="Show password">Show</button></div></div><p class="form-error" id="login-error" role="alert" aria-live="polite"></p><button class="button button-primary button-wide" id="login-submit" type="submit"><span class="login-button-label">Sign in</span></button></form><button class="button button-quiet" type="button" data-action="preview">Preview dashboard with demo data</button><p class="login-foot">Demo preview is read-only and is not an authenticated admin session.</p><a class="public-link" href="../">← Open the public hymnal</a></div></section></main>';
}

function renderShell() {
  const navMarkup = navigation.map(function (item) {
    return '<button class="nav-item" type="button" data-action="navigate" data-view="' + item.id + '" aria-current="' + (state.activeView === item.id ? "page" : "false") + '"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + iconPaths[item.icon] + '</svg></span><span>' + item.label + '</span></button>';
  }).join("");
  root.innerHTML = '<div class="admin-shell"><aside class="sidebar" id="admin-sidebar"><div class="sidebar-brand"><img src="../assets/demo-church-mark.svg" alt=""><div><strong>Consolation Hymnal</strong><span>Admin workspace</span></div></div><p class="sidebar-label">Workspace</p><nav class="sidebar-nav" aria-label="Admin sections">' + navMarkup + '</nav><div class="sidebar-bottom"><button class="nav-item" type="button" data-action="logout"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg></span><span>Exit preview</span></button><a class="sidebar-public-link" href="../">View public hymnal ↗</a></div></aside><button class="sidebar-backdrop" type="button" data-action="close-menu" aria-label="Close navigation" hidden></button><main class="admin-main"><header class="topbar"><div class="topbar-left"><button class="mobile-menu-button" type="button" data-action="toggle-menu" aria-label="Open admin navigation" aria-expanded="false" aria-controls="admin-sidebar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><div><p class="topbar-kicker">Consolation Evangelical and Revival Church</p><p class="topbar-title">Admin workspace</p></div></div><div class="topbar-right"><span class="preview-chip"><span class="preview-dot" aria-hidden="true"></span>Demo preview</span><span class="admin-avatar" aria-label="Demo administrator preview">D</span></div></header><div class="content-wrap" id="admin-content" tabindex="-1"></div></main></div>';
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

async function renderDashboard() {
  const content = document.getElementById("admin-content");
  content.replaceChildren();
  const heading = make("div", "page-heading");
  const titleBox = document.createElement("div");
  titleBox.append(make("h1", "", "Dashboard"), make("p", "", "A simple overview of the hymnal admin workspace."));
  heading.append(titleBox);
  content.append(heading);

  const banner = make("section", "preview-banner");
  banner.setAttribute("aria-label", "Demo preview notice");
  const mark = make("span", "notice-mark", "!"); mark.setAttribute("aria-hidden", "true");
  const bannerCopy = document.createElement("div");
  bannerCopy.append(make("strong", "", "Demo preview · read-only sample data"), make("p", "", "No hymn changes are saved or published. Authentication, database access, and admin authorization are not connected."));
  banner.append(mark, bannerCopy);
  content.append(banner);

  const stats = await getDashboardStats();
  const cards = [
    ["Total Hymns", stats.totalHymns, "Demo records", "book"],
    ["Published Hymns", stats.publishedHymns, "Demo status", "check"],
    ["Draft Hymns", stats.draftHymns, "Demo status", "clock"],
    ["English Hymns", stats.englishHymns, "Sample records", "language"],
    ["Yoruba Hymns", stats.yorubaHymns, "Sample records", "language"],
    ["Categories", stats.categories, "Editable later", "layers"],
    ["Upcoming Service Plans", stats.upcomingServicePlans, "Demo references", "calendar"]
  ];
  const grid = make("section", "stats-grid"); grid.setAttribute("aria-label", "Demo statistics");
  cards.forEach(function (item) {
    const card = make("article", "stat-card");
    const top = make("div", "stat-head");
    top.append(make("span", "stat-label", item[0]), icon(item[3], "stat-icon"));
    card.append(top, make("p", "stat-value", String(item[1])), make("p", "stat-hint", item[2]));
    grid.append(card);
  });
  content.append(grid);

  const lower = make("div", "dashboard-lower");
  const recentPanel = make("section", "panel");
  const recentHeader = make("header", "panel-header");
  const recentTitle = document.createElement("div"); recentTitle.append(make("h2", "", "Recently Updated Hymns"), make("p", "", "Example records from the local admin preview."));
  recentHeader.append(recentTitle);
  recentPanel.append(recentHeader);
  const body = make("div", "panel-body");
  const tableWrap = make("div", "table-wrap");
  const table = make("table", "recent-table");
  table.innerHTML = '<thead><tr><th scope="col">Hymn</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead><tbody></tbody>';
  const tbody = table.querySelector("tbody");
  getRecentlyUpdatedHymns(5).then(function (hymns) {
    hymns.forEach(function (hymn) {
      const row = document.createElement("tr");
      const hymnCell = document.createElement("td");
      hymnCell.append(make("span", "hymn-name", hymn.title_en), make("span", "hymn-number", "Demo #" + String(hymn.hymn_number).padStart(2, "0")));
      const statusCell = document.createElement("td");
      const status = make("span", "status-pill " + (hymn.status === "published" ? "status-published" : "status-draft"), hymn.status === "published" ? "Published" : "Draft");
      statusCell.append(status);
      const dateCell = document.createElement("td");
      const date = new Date(hymn.updated_at);
      dateCell.textContent = Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
      row.append(hymnCell, statusCell, dateCell);
      tbody.append(row);
    });
  }).catch(function () {
    const row = document.createElement("tr");
    const cell = make("td", "", "Demo data is unavailable."); cell.colSpan = 3; row.append(cell); tbody.append(row);
  });
  tableWrap.append(table); body.append(tableWrap, make("p", "demo-caption", "These titles and counts are original placeholders, not live church records."));
  recentPanel.append(body);

  const actionsPanel = make("section", "panel");
  const actionsHeader = make("header", "panel-header");
  const actionsTitle = document.createElement("div"); actionsTitle.append(make("h2", "", "Quick Actions"), make("p", "", "Shortcuts for future admin tools."));
  actionsHeader.append(actionsTitle); actionsPanel.append(actionsHeader);
  const actionsBody = make("div", "panel-body");
  const actions = [
    ["Add New Hymn", "plus", "hymns"],
    ["Manage Hymns", "book", "hymns"],
    ["Manage Categories", "layers", "categories"],
    ["Create Service Plan", "calendar", "services"]
  ];
  const actionList = make("div", "quick-actions");
  actions.forEach(function (item) {
    const button = make("button", "quick-action", "");
    button.type = "button"; button.dataset.action = "navigate"; button.dataset.view = item[2];
    button.append(icon(item[1], "quick-action-icon"), make("span", "", item[0]), make("span", "quick-arrow", "›"));
    actionList.append(button);
  });
  actionsBody.append(actionList, make("p", "demo-caption", "Actions open a clear placeholder until that phase is built."));
  actionsPanel.append(actionsBody);
  lower.append(recentPanel, actionsPanel);
  content.append(lower);
}

function renderPlaceholder(view) {
  const content = document.getElementById("admin-content");
  content.replaceChildren();
  const item = navigation.find(function (entry) { return entry.id === view; });
  const title = item ? item.label : "Dashboard";
  const heading = make("div", "page-heading");
  const headingContent = document.createElement("div");
  headingContent.append(make("h1", "", title), make("p", "", "This section is reserved for a later phase."));
  heading.append(headingContent); content.append(heading);
  const card = make("section", "placeholder-card");
  const inner = make("div", "placeholder-inner");
  inner.append(icon(item ? item.icon : "grid", "placeholder-icon"), make("h2", "", "Coming in the next phase"), make("p", "", "The Phase 2A foundation keeps this section separate and ready without adding unfinished editing, category, service-planning, or settings behavior."));
  const back = make("button", "button button-secondary", "Back to dashboard");
  back.type = "button"; back.dataset.action = "navigate"; back.dataset.view = "dashboard";
  inner.append(back); card.append(inner); content.append(card);
}

function renderCurrentView() {
  root.querySelectorAll(".nav-item[data-view]").forEach(function (button) {
    button.setAttribute("aria-current", button.dataset.view === state.activeView ? "page" : "false");
  });
  if (state.activeView === "dashboard") renderDashboard();
  else renderPlaceholder(state.activeView);
}

root.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "toggle-password") {
    const input = document.getElementById("admin-password");
    if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    button.textContent = show ? "Hide" : "Show";
    button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  } else if (action === "preview") {
    state.view = "preview"; state.activeView = "dashboard"; closeMenu(); renderShell();
  } else if (action === "navigate") {
    state.activeView = button.dataset.view || "dashboard"; closeMenu(); renderCurrentView();
    const content = document.getElementById("admin-content"); if (content) content.focus({ preventScroll: true });
  } else if (action === "toggle-menu") {
    state.menuOpen = !state.menuOpen;
    const sidebar = document.getElementById("admin-sidebar");
    const toggle = root.querySelector('[data-action="toggle-menu"]');
    const backdrop = root.querySelector(".sidebar-backdrop");
    if (sidebar) sidebar.classList.toggle("is-open", state.menuOpen);
    if (toggle) toggle.setAttribute("aria-expanded", String(state.menuOpen));
    if (backdrop) backdrop.hidden = !state.menuOpen;
  } else if (action === "close-menu") {
    closeMenu();
  } else if (action === "logout") {
    logoutAdmin().finally(function () { state.view = "login"; state.activeView = "dashboard"; renderLogin(); });
  }
});

root.addEventListener("submit", async function (event) {
  if (event.target.id !== "admin-login-form") return;
  event.preventDefault();
  const email = document.getElementById("admin-email");
  const password = document.getElementById("admin-password");
  const feedback = document.getElementById("login-error");
  const submit = document.getElementById("login-submit");
  const label = submit.querySelector(".login-button-label");
  feedback.textContent = "";
  if (!email.value.trim() || !email.validity.valid || !password.value) {
    feedback.textContent = "Enter a valid email address and password to continue.";
    (!email.value.trim() || !email.validity.valid ? email : password).focus();
    return;
  }
  submit.disabled = true; submit.setAttribute("aria-busy", "true");
  label.textContent = "Checking…";
  try {
    await loginAdmin(email.value.trim(), password.value);
  } catch (error) {
    feedback.textContent = error && error.message ? error.message : "Sign-in is not available in this phase.";
  } finally {
    submit.disabled = false; submit.removeAttribute("aria-busy"); label.textContent = "Sign in";
  }
});

initializeAdminAuth().then(function (result) { state.authStatus = result; }).catch(function () { state.authStatus = null; });
renderLogin();

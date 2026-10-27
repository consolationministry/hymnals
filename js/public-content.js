import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";
import { readLocal, writeLocal } from "./local-store.js";

const PROGRAMS_CACHE_KEY = "cerc-public-programs-v5";
const SERVICE_PLANS_CACHE_KEY = "cerc-public-service-plans-v2";

function localDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export function servicePlanDayLabel(value, nowValue, locale) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").slice(0, 10));
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return "";

  const now = nowValue instanceof Date ? nowValue : nowValue ? new Date(nowValue) : new Date();
  if (!Number.isNaN(now.getTime()) && localDateKey(date) === localDateKey(now)) return "Today’s Service";

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function programmeSortTime(program) {
  const postedAt = Date.parse(program && program.created_at || "");
  if (!Number.isNaN(postedAt)) return postedAt;
  const eventDate = String(program && program.start_date || "").slice(0, 10);
  const eventAt = Date.parse(eventDate + "T00:00:00Z");
  return Number.isNaN(eventAt) ? 0 : eventAt;
}

function validPrograms(rows) {
  return rows.filter(function (program) {
    if (!program || typeof program !== "object" || !program.title || !program.start_date) return false;
    return true;
  }).sort(function (left, right) {
    return programmeSortTime(right) - programmeSortTime(left);
  });
}

function validServicePlans(rows) {
  return rows.filter(function (plan) {
    return plan && typeof plan === "object" && plan.title && plan.date;
  });
}

async function requestRows(table, select, order) {
  const query = new URLSearchParams({ select, order });
  const response = await fetch(
    SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/" + table + "?" + query.toString(),
    {
      method: "GET",
      cache: "no-store",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
        accept: "application/json"
      }
    }
  );
  if (!response.ok) return { response, rows: null };
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("Public content response was invalid.");
  return { response, rows };
}

async function fetchRows(table, select, order, cacheKey, fallbacks) {
  const cached = readLocal(cacheKey, null);
  const cachedRows = Array.isArray(cached) ? cached : [];
  if (typeof fetch !== "function" || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { rows: cachedRows, available: false, usingCache: cachedRows.length > 0 };
  }

  try {
    const requests = [{ select, order }].concat(Array.isArray(fallbacks) ? fallbacks : fallbacks ? [fallbacks] : []);
    let result = null;
    for (const request of requests) {
      result = await requestRows(table, request.select, request.order);
      if (result.rows) break;
      if (![400, 401, 403].includes(result.response.status)) break;
    }
    if (!result || !result.rows) throw new Error("Public content is unavailable.");
    writeLocal(cacheKey, result.rows);
    return { rows: result.rows, available: true, usingCache: false };
  } catch (error) {
    return { rows: cachedRows, available: false, usingCache: cachedRows.length > 0 };
  }
}

export async function getMemberContent() {
  const [programResult, planResult] = await Promise.all([
    fetchRows(
      "programs",
      "id,title,minister,category,description,venue,start_date,end_date,flyer_data_url,created_at,response_question,yes_label,no_label",
      "created_at.desc",
      PROGRAMS_CACHE_KEY,
      [
        { select: "id,title,minister,description,venue,start_date,end_date,flyer_data_url,created_at,response_question,yes_label,no_label", order: "created_at.desc" },
        { select: "id,title,description,venue,start_date,end_date,flyer_data_url,created_at,response_question,yes_label,no_label", order: "created_at.desc" },
        { select: "id,title,venue,start_date,end_date,flyer_data_url,created_at", order: "created_at.desc" },
        { select: "id,title,venue,start_date,end_date,flyer_data_url", order: "start_date.desc" }
      ]
    ),
    fetchRows("service_plans", "id,title,date,hymn_ids", "date.desc", SERVICE_PLANS_CACHE_KEY)
  ]);

  return {
    programs: validPrograms(programResult.rows),
    servicePlans: validServicePlans(planResult.rows),
    programsAvailable: programResult.available,
    servicePlansAvailable: planResult.available,
    usingCache: programResult.usingCache || planResult.usingCache
  };
}

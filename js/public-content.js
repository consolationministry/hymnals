import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";
import { readLocal, writeLocal } from "./local-store.js";

const PROGRAMS_CACHE_KEY = "cerc-public-programs-v1";
const SERVICE_PLANS_CACHE_KEY = "cerc-public-service-plans-v1";

function getToday(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function filterUpcomingPrograms(rows, today) {
  return rows.filter(function (program) {
    if (!program || typeof program !== "object" || !program.title || !program.start_date) return false;
    const lastDay = program.end_date || program.start_date;
    return String(lastDay).slice(0, 10) >= today;
  });
}

function filterUpcomingPlans(rows, today) {
  return rows.filter(function (plan) {
    return plan && typeof plan === "object" && plan.title && plan.date && String(plan.date).slice(0, 10) >= today;
  });
}

async function fetchRows(table, select, filters, cacheKey) {
  const cached = readLocal(cacheKey, null);
  const cachedRows = Array.isArray(cached) ? cached : [];
  if (typeof fetch !== "function" || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { rows: cachedRows, available: false, usingCache: cachedRows.length > 0 };
  }

  const query = new URLSearchParams(Object.assign({ select }, filters));
  try {
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
    if (!response.ok) throw new Error("Public content is unavailable.");
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Public content response was invalid.");
    writeLocal(cacheKey, rows);
    return { rows, available: true, usingCache: false };
  } catch (error) {
    return { rows: cachedRows, available: false, usingCache: cachedRows.length > 0 };
  }
}

export async function getUpcomingMemberContent(todayValue) {
  const today = getToday(todayValue);
  const [programResult, planResult] = await Promise.all([
    fetchRows("programs", "id,title,venue,start_date,end_date,flyer_data_url", {
      or: "(end_date.gte." + today + ",and(end_date.is.null,start_date.gte." + today + "))",
      order: "start_date.asc"
    }, PROGRAMS_CACHE_KEY),
    fetchRows("service_plans", "id,title,date,hymn_ids", {
      date: "gte." + today,
      order: "date.asc"
    }, SERVICE_PLANS_CACHE_KEY)
  ]);

  return {
    programs: filterUpcomingPrograms(programResult.rows, today),
    servicePlans: filterUpcomingPlans(planResult.rows, today),
    programsAvailable: programResult.available,
    servicePlansAvailable: planResult.available,
    usingCache: programResult.usingCache || planResult.usingCache
  };
}

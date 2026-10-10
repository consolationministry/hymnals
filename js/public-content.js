import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";
import { readLocal, writeLocal } from "./local-store.js";

const PROGRAMS_CACHE_KEY = "cerc-public-programs-v2";
const SERVICE_PLANS_CACHE_KEY = "cerc-public-service-plans-v2";

function validPrograms(rows) {
  return rows.filter(function (program) {
    if (!program || typeof program !== "object" || !program.title || !program.start_date) return false;
    return true;
  });
}

function validServicePlans(rows) {
  return rows.filter(function (plan) {
    return plan && typeof plan === "object" && plan.title && plan.date;
  });
}

async function fetchRows(table, select, order, cacheKey) {
  const cached = readLocal(cacheKey, null);
  const cachedRows = Array.isArray(cached) ? cached : [];
  if (typeof fetch !== "function" || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { rows: cachedRows, available: false, usingCache: cachedRows.length > 0 };
  }

  const query = new URLSearchParams({ select, order });
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

export async function getMemberContent() {
  const [programResult, planResult] = await Promise.all([
    fetchRows("programs", "id,title,venue,start_date,end_date,flyer_data_url", "start_date.desc", PROGRAMS_CACHE_KEY),
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

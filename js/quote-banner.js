// Typewriter quote banner: types the current hour's quote, holds, erases, then the next one.
// Only the hymn home page and the live audio page show it (see render() in app.js).
import { currentBibleQuote } from "./bible-quotes.js";

const TYPE_MS = 55;
const ERASE_MS = 28;
const HOLD_MS = 4200;
const GAP_MS = 700;

let timer = null;

export function quoteBannerHtml(date = new Date()) {
  const quote = currentBibleQuote(date);
  return '<aside class="quote-banner" data-quote-banner aria-label="Bible quote of the hour">' +
    '<p class="quote-banner-text" data-quote-text></p>' +
    '<p class="quote-banner-ref" data-quote-ref hidden>' + quote.ref + '</p>' +
    '</aside>';
}

// Call after the banner is in the DOM. Stops any previous run first.
export function startQuoteBanner(root, date = new Date()) {
  stopQuoteBanner();
  const banner = root.querySelector("[data-quote-banner]");
  if (!banner) return;
  const quote = currentBibleQuote(date);
  const textEl = banner.querySelector("[data-quote-text]");
  const refEl = banner.querySelector("[data-quote-ref]");
  const full = "\u201C" + quote.text + "\u201D";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    textEl.textContent = full;
    refEl.hidden = false;
    return;
  }
  let index = 0;
  function type() {
    index += 1;
    textEl.textContent = full.slice(0, index);
    if (index < full.length) {
      timer = window.setTimeout(type, TYPE_MS);
    } else {
      refEl.hidden = false;
      timer = window.setTimeout(erase, HOLD_MS);
    }
  }
  function erase() {
    refEl.hidden = true;
    index -= 1;
    textEl.textContent = full.slice(0, Math.max(index, 0));
    if (index > 0) timer = window.setTimeout(erase, ERASE_MS);
    else timer = window.setTimeout(type, GAP_MS);
  }
  timer = window.setTimeout(type, GAP_MS);
}

export function stopQuoteBanner() {
  if (timer) window.clearTimeout(timer);
  timer = null;
}

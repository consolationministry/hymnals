// Typewriter quote banner: types a quote, holds it for about 5 seconds, erases it, then
// continues straight into the next quote in the collection. Rotation is continuous, not hourly.
// Only the hymn home page and the live audio page show it (see render() in app.js).
import { bibleQuoteAt, nextBibleQuoteIndex, saveBibleQuoteIndex } from "./bible-quotes.js";

const TYPE_MS = 55;
const ERASE_MS = 28;
const HOLD_MS = 5000;
const GAP_MS = 700;

let timer = null;

export function quoteBannerHtml() {
  return '<aside class="quote-banner" data-quote-banner aria-label="Bible quote">' +
    '<p class="quote-banner-text" data-quote-text></p>' +
    '<p class="quote-banner-ref" data-quote-ref hidden></p>' +
    '</aside>';
}

// Call after the banner is in the DOM. Stops any previous run first.
export function startQuoteBanner(root) {
  stopQuoteBanner();
  const banner = root.querySelector("[data-quote-banner]");
  if (!banner) return;
  const textEl = banner.querySelector("[data-quote-text]");
  const refEl = banner.querySelector("[data-quote-ref]");
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const position = nextBibleQuoteIndex();
    saveBibleQuoteIndex(position);
    const quote = bibleQuoteAt(position);
    textEl.textContent = "\u201C" + quote.text + "\u201D";
    refEl.textContent = quote.ref;
    refEl.hidden = false;
    return;
  }
  let full = "";
  let index = 0;
  function nextQuote() {
    const position = nextBibleQuoteIndex();
    saveBibleQuoteIndex(position);
    const quote = bibleQuoteAt(position);
    full = "\u201C" + quote.text + "\u201D";
    refEl.textContent = quote.ref;
    index = 0;
    refEl.hidden = true;
    timer = window.setTimeout(type, GAP_MS);
  }
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
    else timer = window.setTimeout(nextQuote, GAP_MS);
  }
  nextQuote();
}

export function stopQuoteBanner() {
  if (timer) window.clearTimeout(timer);
  timer = null;
}

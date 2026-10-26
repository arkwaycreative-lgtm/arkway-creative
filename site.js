(function(){
var $=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var nav=document.getElementById("navlinks"),mb=document.getElementById("menuBtn");
if(mb)mb.addEventListener("click",function(){nav.classList.toggle("open")});

// Product filters
function applyFilter(f){var shown=0;$(".product-card").forEach(function(c){var ok=f==="ALL PRODUCTS"||c.dataset.cat===f;c.hidden=!ok;if(ok)shown++});
$("[data-filter]").forEach(function(b){b.classList.toggle("active",b.dataset.filter===f)});
var e=document.getElementById("productEmpty");if(e)e.hidden=shown>0}
$("[data-filter]").forEach(function(b){b.addEventListener("click",function(){applyFilter(b.dataset.filter);history.replaceState(null,"",b.dataset.filter==="ALL PRODUCTS"?location.pathname:"?filter="+encodeURIComponent(b.dataset.filter))})});
var q=new URLSearchParams(location.search).get("filter");if(q&&$("[data-filter]").length)applyFilter(q);

// Demo play toggle
$("[data-play]").forEach(function(b){b.addEventListener("click",function(){var w=b.closest(".product-preview").querySelector(".waveform");w.classList.toggle("playing");b.textContent=w.classList.contains("playing")?"Ⅱ Pause Demo":"▶ Play Demo"})});

// Share link
$("[data-share]").forEach(function(b){b.addEventListener("click",function(){var u=location.origin+"/products#product-"+b.dataset.share;
var done=function(){b.textContent="Link Copied";setTimeout(function(){b.textContent="Link Copied →"},1800)};
if(navigator.clipboard)navigator.clipboard.writeText(u).then(done,function(){window.prompt("Copy this ArkWay product link:",u)});else window.prompt("Copy this ArkWay product link:",u)})});

// Discography toggle
$("[data-mode]").forEach(function(b){b.addEventListener("click",function(){$("[data-mode]").forEach(function(x){x.classList.toggle("active",x===b)});
document.getElementById("stream").hidden=b.dataset.mode!=="stream";document.getElementById("download").hidden=b.dataset.mode!=="download"})});

// Booking modal with history/back-button support
var modalActiveState = false;

function closeBookingModal() {
  var w = document.querySelector(".modal-backdrop");
  if (w) {
    w.remove();
    document.body.classList.remove("locked");
  }
  modalActiveState = false;
}

$(".book-service").forEach(function(b){b.addEventListener("click",function(){
  document.body.classList.add("locked");
  var w=document.createElement("div");
  w.className="modal-backdrop";
  var s=b.dataset.service.replace(/</g,"&lt;");
  w.innerHTML='<div class="modal" role="dialog" aria-modal="true"><button class="modal-close" aria-label="Close">×</button><p class="eyebrow">INSTANT INQUIRY</p><h2>Book <em>'+s+'</em></h2><p>Choose how you want to start the conversation. Your service details will be pre-filled.</p><div class="modal-actions"><a class="primary large" target="_blank" rel="noopener" href="'+b.dataset.wa+'">Open WhatsApp →</a><a class="secondary large" href="'+b.dataset.em+'">Send Email ✉</a></div><span class="modal-note">0118618199 · arkwaycreative@gmail.com</span></div>';
  document.body.appendChild(w);

  if (!modalActiveState) {
    modalActiveState = true;
    history.pushState({ bookingModalOpen: true }, "");
  }

  var close=function(){
    if (modalActiveState) {
      history.back();
    } else {
      closeBookingModal();
    }
  };

  w.addEventListener("mousedown",function(e){if(e.target===w)close()});
  w.querySelector(".modal-close").addEventListener("click",close);

  document.addEventListener("keydown",function k(e){if(e.key==="Escape"){close();document.removeEventListener("keydown",k)}});
})});

window.addEventListener("popstate", function(e) {
  if (modalActiveState) {
    closeBookingModal();
  }
});

/* ==========================================
   ARKWAY CREATIVE — NOAH CHATBOT (Refined)
   ========================================== */

var noahState = {
  lastTopic: "",
  lastQuestion: "",
  greeted: false,
  lastKeys: [],
  service: "",
  need: "",
  hasBeat: false,
  hasVocals: false,
  pending: "",
  fallbacks: 0,
  turns: 0
};

var NOAH_LINK = "https://wa.me/254118618199";
var NOAH_EMAIL = "mailto:arkwaycreative@gmail.com";

/* Base fallback services reference (synchronized with live DOM when available) */
var NOAH_SERVICES = {
  vocal:     { name: "Quick Vocal Session",                price: "KSh 3,000",       amount: 3000 },
  mixmaster: { name: "External Vocal Mix & Master",        price: "KSh 2,500",       amount: 2500 },
  single:    { name: "Complete Single Package",            price: "KSh 5,500",       amount: 5500 },
  custom:    { name: "Full Custom Beat & Song Production", price: "KSh 8,500",       amount: 8500 },
  guitar:    { name: "Acoustic/Lead Guitar Session",       price: "KSh 2,500",       amount: 2500 },
  bass:      { name: "Live Bass Tracking",                 price: "KSh 2,500",       amount: 2500 },
  full:      { name: "Full Instrumentation Package",       price: "KSh 12,000",      amount: 12000 },
  ads:       { name: "Radio/Social Ads & Jingles",         price: "KSh 12,000",      amount: 12000 },
  film:      { name: "Film/Series Scoring",                price: "from KSh 15,000", amount: 15000 },
  voice:     { name: "Voiceover/Podcast Audio Cleaning",   price: "KSh 5,000",       amount: 5000 }
};
var NOAH_ORDER = ["vocal", "mixmaster", "single", "custom", "guitar", "bass", "full", "ads", "film", "voice"];

var NOAH_NOTES = {
  vocal: "If you already have your beat, bring it along and record your vocals with us. The session is designed to help you leave with your song recorded.",
  mixmaster: "Already recorded your song? Send us your recorded vocals and instrumental, and we'll mix and master them. This option is for an existing recording, not a new vocal-recording session.",
  single: "A complete bundled option for your track. Check the service card details on the website for exact package inclusions.",
  custom: "Custom production built from scratch for your vision. This is a full production service, not just a standalone beat lease.",
  guitar: "Professional acoustic or lead guitar tracking to add depth and organic texture to your production.",
  bass: "Live bass tracking tailored to groove tightly with your mix and low-end arrangement.",
  full: "Full live instrumentation package providing comprehensive musical depth across multiple instrument tracks.",
  ads: "Professional ad scoring and jingles tailored for commercial broadcast, social media, and campaigns.",
  film: "Original scoring tailored for films, series, or video projects. Final scope depends on project requirements.",
  voice: "Dedicated audio cleaning, restoration, and enhancement for podcasts, voiceovers, and spoken-word media."
};

var NOAH_MAIN = [
  ["Explore Services", "what services do you offer"],
  ["Find a Product", "where can i buy your products"],
  ["Get Pricing", "how much do your services cost"],
  ["Help With My Project", "i dont know which service i need"],
  ["Contact ArkWay", "how do i contact you"]
];
var NOAH_GROUPS = [
  ["Recording & mixing", "vocal recording and mixing"],
  ["Beats & production", "i need a beat"],
  ["Live instruments", "guitar bass and full instrumentation"],
  ["Film, ads & voice", "ads film and voiceover"]
];

var noahQuickRow = null;

function noahHas(text, words) {
  return words.some(function(word) { return text.indexOf(word) !== -1; });
}

function noahLink(url, label, color) {
  var external = /^https?:/.test(url);
  return '<a href="' + url.replace(/&/g, "&amp;") + '"' +
    (external ? ' target="_blank" rel="noopener"' : '') +
    ' style="color:' + (color || "#D4AF37") +
    ';font-weight:bold;">' + label + '</a>';
}

function noahContactLink() { return noahLink(NOAH_LINK, "Talk to ArkWay on WhatsApp →", "#E2C66B"); }
function noahServicesLink() { return noahLink("/services", "Explore Services →"); }
function noahProductsLink() { return noahLink("/products", "Browse the Sound Vault →"); }
function noahCommunityLink() { return noahLink("/community", "Explore Yovan's Music & Writing →"); }

function noahResetState() {
  noahState.lastTopic = ""; noahState.lastQuestion = ""; noahState.lastKeys = [];
  noahState.service = ""; noahState.need = ""; noahState.hasBeat = false;
  noahState.hasVocals = false; noahState.pending = ""; noahState.fallbacks = 0; noahState.turns = 0;
}

function noahDefaultChips(topic) {
  if (topic === "audio") return [["Get pricing", "how much"], ["Book a session", "how do i book"]];
  if (topic === "film") return [["Get pricing", "how much"], ["Request a quote", "how do i contact you"]];
  if (topic === "products") return [["Custom beat instead", "i need a custom beat"], ["Contact ArkWay", "how do i contact you"]];
  return [["Explore services", "what services do you offer"], ["Get pricing", "how much do your services cost"]];
}

function noahAnswer(html, topic, opts) {
  opts = opts || {};
  if (topic) noahState.lastTopic = topic;
  if (!opts.keep) {
    noahState.lastKeys = opts.keys || [];
    noahState.service = noahState.lastKeys.length === 1 ? noahState.lastKeys[0] : "";
    noahState.pending = opts.pending || "";
    if (!opts.fallback) noahState.fallbacks = 0;
  }
  window.appendNoahMessage(html, false);
  var chips = opts.chips;
  if (chips === undefined) chips = noahDefaultChips(noahState.lastTopic);
  noahAddQuick(chips, opts.noRestart);
}

function noahClearQuick() {
  if (noahQuickRow && noahQuickRow.parentNode) { noahQuickRow.parentNode.removeChild(noahQuickRow); }
  noahQuickRow = null;
}

function noahAddQuick(chips, noRestart) {
  noahClearQuick();
  var box = document.getElementById("noah-messages");
  if (!box || !chips || !chips.length) return;
  var list = chips.slice(0, noRestart ? 5 : 4);
  if (!noRestart) list.push(["↺ Start over", "__restart"]);

  var row = document.createElement("div");
  row.setAttribute("data-noah-quick", "1");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px;";

  list.forEach(function(c) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = c[0];
    b.style.cssText = "border:1px solid #D4AF37;background:transparent;color:#E2C66B;" +
      "border-radius:999px;padding:8px 12px;font-size:13px;line-height:1.2;" +
      "min-height:36px;cursor:pointer;font-family:inherit;";
    b.addEventListener("click", function() { window.handleNoahQuick(c[0], c[1]); });
    row.appendChild(b);
  });
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
  noahQuickRow = row;
}

window.handleNoahQuick = function(label, text) {
  noahClearQuick();
  window.appendNoahMessage(label, true);
  if (text === "__restart") { setTimeout(noahRestart, 250); return; }
  setTimeout(function() { noahRespond(text); }, 250);
};

function noahRestart() {
  noahResetState();
  noahAnswer("Fresh start — what would you like to do?", "", { chips: NOAH_MAIN, noRestart: true });
}

window.toggleNoahChat = function() {
  var container = document.getElementById("noah-chatbot-container");
  var win = document.getElementById("noah-chat-window");
  var openIcon = document.getElementById("noah-icon-open");
  var closeIcon = document.getElementById("noah-icon-close");
  if (!win) return;
  var isHidden = win.classList.contains("noah-hidden");
  if (isHidden) {
    win.classList.remove("noah-hidden");
    if (container) container.classList.add("active");
    if (openIcon) openIcon.style.display = "none";
    if (closeIcon) closeIcon.style.display = "inline";
    if (!noahState.greeted) noahState.greeted = true;
    var msgs = document.getElementById("noah-messages");
    if (msgs && !msgs.firstChild) {
      window.appendNoahMessage("Need guidance? Ask Noah. I can help you explore services, find products, understand prices, and choose the right option for your project. What are you working on?", false);
      noahAddQuick(NOAH_MAIN, true);
    }
  } else {
    win.classList.add("noah-hidden");
    if (container) container.classList.remove("active");
    if (openIcon) openIcon.style.display = "block";
    if (closeIcon) closeIcon.style.display = "none";
  }
};

window.appendNoahMessage = function(text, isUser) {
  var container = document.getElementById("noah-messages");
  if (!container) return;
  if (!container.getAttribute("aria-live")) {
    container.setAttribute("aria-live", "polite");
    container.style.overscrollBehavior = "contain";
  }
  var msgDiv = document.createElement("div");
  msgDiv.className = "noah-msg " + (isUser ? "noah-msg-user" : "noah-msg-bot");
  if (isUser) { msgDiv.textContent = text; } else { msgDiv.innerHTML = text; }
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
};

/* Expanded Answers & FAQ Handlers */
function noahPrices() {
  return "<strong>ArkWay service rates (in KSh)</strong><br/>" +
    "• Quick Vocal Session — KSh 3,000<br/>" +
    "• External Vocal Mix & Master — KSh 2,500<br/>" +
    "• Complete Single Package — KSh 5,500<br/>" +
    "• Full Custom Beat & Song Production — KSh 8,500<br/>" +
    "• Acoustic/Lead Guitar Session — KSh 2,500<br/>" +
    "• Live Bass Tracking — KSh 2,500<br/>" +
    "• Full Instrumentation Package — KSh 12,000<br/>" +
    "• Radio/Social Ads & Jingles — KSh 12,000<br/>" +
    "• Film/Series Scoring — from KSh 15,000<br/>" +
    "• Voiceover/Podcast Audio Cleaning — KSh 5,000<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
}

function noahAudio() {
  return "<strong>Audio Production & Services</strong><br/>" +
    "We offer professional recording, mixing, mastering, and instrumentation tailored to your project.<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
}

function noahProducts() {
  return "<strong>The ArkWay Sound Vault</strong><br/>" +
    "Explore our digital products, beat packs, and loop kits. Click Buy on any product to check its description and complete your purchase securely via Hustlesasa.<br/><br/>" +
    noahProductsLink();
}

function noahLicensingAnswer() {
  return "Each product has its own licensing details. Click Buy to open its Hustlesasa page, then read the product description before purchasing. It explains the applicable terms (such as usage rights and streaming permissions).";
}

function noahFreeSampleAnswer() {
  return "Yes, the designated free samples are free. Just follow the instructions provided on the download page to access them.";
}

function noahPaymentAnswer() {
  return "Purchases are handled securely through our Hustlesasa storefront, which supports card payments and international purchases from outside Kenya.";
}

function noahHuman() {
  return "You can reach the ArkWay team directly via WhatsApp or email:<br/><br/>" +
    "• <strong>WhatsApp / Call:</strong> +254 118 618 199<br/>" +
    "• <strong>Email:</strong> arkwaycreative@gmail.com<br/><br/>" +
    noahContactLink() + "<br/>" + noahLink(NOAH_EMAIL, "Send an email →");
}

function noahFallback() {
  return "Your ArkWay creative assistant can help you explore services, find products, understand prices, and choose the right option for your project. What are you working on?";
}

function noahNorm(text) {
  var t = String(text).toLowerCase().replace(/[’‘`']/g, "");
  t = t.replace(/&/g, " and ");
  t = t.replace(/(\d),(?=\d{3}\b)/g, "$1");
  t = t.replace(/(\d+(?:\.\d+)?)\s*k\b/g, function(m, n) { return String(Math.round(parseFloat(n) * 1000)); });
  t = t.replace(/(ksh|kshs|kes)(\d)/g, "$1 $2");
  t = t.replace(/[^a-z0-9\s]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

var NOAH_PATTERNS = {
  mix: /\b(mix|mixing|mixed|master|mastering|mastered|polish|external mix|external vocal)\b/,
  single: /\b(complete single|single package|full single)\b/,
  custom: /\b(custom beat|custom production|full custom|song production|full production)\b/,
  guitar: /\bguitars?\b/,
  bass: /\bbass(es|ist)?\b/,
  full: /\b(instrumentation|live band|full band|all instruments)\b/,
  ads: /\b(adverts?|advertisements?|ads?|jingles?|radio|commercials?)\b/,
  film: /\b(films?|movies?|series|scor(e|ing)|soundtrack)\b/,
  voice: /\b(voice ?overs?|podcasts?|audio cleaning|clean audio)\b/
};

function noahDetect(q) {
  var d = { keys: [], product: false, beat: false };
  var P = NOAH_PATTERNS, found = {}, k;
  for (k in P) { if (P.hasOwnProperty(k) && P[k].test(q)) found[k] = true; }
  if (found.mix) found.mixmaster = true;

  if (/\b(record|recording|vocal session|quick vocal|sing|rapping)\b/.test(q) && !found.mix) found.vocal = true;
  NOAH_ORDER.forEach(function(key) { if (found[key]) d.keys.push(key); });

  d.licensing = /\b(rights|licensing|license|commercial|royalties|redistribution|streaming|exclusive)\b/.test(q);
  d.freeSample = /\b(free|sample|samples|download|freebie)\b/.test(q);
  d.payment = /\b(pay|payment|outside kenya|international|card|visa|mastercard|currency|dollar)\b/.test(q);
  d.product = /\b(products?|shop|store|buy|purchase|Vault|packs?|loops?)\b/.test(q);
  d.price = /\b(price|prices|pricing|cost|costs|how much|ksh|kes)\b/.test(q);
  d.book = /\b(book|booking|reserve|schedule)\b/.test(q);
  d.contact = /\b(contact|whatsapp|email|phone|reach)\b/.test(q);
  d.human = /\b(human|real person|team|yovan|someone)\b/.test(q);
  return d;
}

function noahRespond(raw) {
  var S = noahState;
  var q = noahNorm(raw);
  S.lastQuestion = q;
  S.turns++;

  if (!q) {
    noahAnswer(noahFallback(), "", { keep: true, chips: NOAH_MAIN, noRestart: true });
    return;
  }

  if (/\b(start over|restart|reset|menu)\b/.test(q)) {
    noahRestart();
    return;
  }

  var d = noahDetect(q);

  if (d.licensing) {
    noahAnswer(noahLicensingAnswer(), "products", { chips: [["Browse products", "where can i buy your products"]] });
    return;
  }
  if (d.freeSample) {
    noahAnswer(noahFreeSampleAnswer(), "products", { chips: [["Browse products", "where can i buy your products"]] });
    return;
  }
  if (d.payment) {
    noahAnswer(noahPaymentAnswer(), "contact", { chips: [["Contact ArkWay", "how do i contact you"]] });
    return;
  }
  if (d.human || d.contact) {
    noahAnswer(noahHuman(), "contact", { keep: true, chips: [] });
    return;
  }
  if (d.keys.length === 1) {
    var key = d.keys[0];
    var s = NOAH_SERVICES[key];
    noahAnswer("<strong>" + s.name + "</strong> — " + s.price + "<br/>" + NOAH_NOTES[key] + "<br/><br/>" + noahServicesLink() + "<br/>" + noahContactLink(), "audio", { keys: [key] });
    return;
  }
  if (d.price) {
    noahAnswer(noahPrices(), "services", { chips: [["Explore services", "what services do you offer"]] });
    return;
  }
  if (d.product) {
    noahAnswer(noahProducts(), "products", { chips: [["Ask about licensing", "what are the licensing terms"]] });
    return;
  }

  noahAnswer(noahFallback(), "", { keep: true, chips: NOAH_MAIN, noRestart: true });
}

window.sendNoahMessage = function() {
  var input = document.getElementById("noah-input");
  if (!input) return;
  var original = input.value.trim();
  if (!original) return;
  noahClearQuick();
  window.appendNoahMessage(original, true);
  input.value = "";
  setTimeout(function() { noahRespond(original); }, 250);
};

window.handleNoahKeyPress = function(event) {
  if (event.isComposing) return;
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    window.sendNoahMessage();
  }
};

})();

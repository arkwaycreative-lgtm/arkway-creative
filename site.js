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
var done=function(){b.textContent="Link Copied";setTimeout(function(){b.textContent="Share Link →"},1800)};
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
   ARKWAY CREATIVE — NOAH CHATBOT
   Local JavaScript version; no API required.
   Rule-based intent scoring + lightweight
   client-side conversation context.
   ========================================== */

var noahState = {
  lastTopic: "",
  lastQuestion: "",
  greeted: false,
  lastKeys: [],     // service keys most recently discussed
  service: "",      // single service in focus, if any
  need: "",         // "song" when the visitor is making/releasing a song
  hasBeat: false,
  hasVocals: false,
  pending: "",      // "book" | "price" | "budget" while waiting for an answer
  fallbacks: 0,
  turns: 0
};

var NOAH_LINK = "https://wa.me/254118618199";
var NOAH_EMAIL = "mailto:arkwaycreative@gmail.com";

/* ---------- Service price reference (from original code) ---------- */
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
  vocal: "A good starting point if you need vocals recorded. If you also want them mixed and polished, there's the External Vocal Mix & Master option.",
  mixmaster: "This is the listed option for mixing and mastering your vocals.",
  single: "A bundled option for finishing a single. I don't have its exact contents here, so check the Services page or ask the team what's included.",
  custom: "This is the full beat-and-song production service, so it isn't a beat-only price.",
  guitar: "For acoustic or lead guitar parts on your track.",
  bass: "For live bass parts on your track.",
  full: "The listed package for full live instrumentation. Ask the team what's included for your song.",
  ads: "For radio or social adverts and jingles. Final quotes can depend on the project's requirements.",
  film: "Scoring starts from this price. Final quotes can depend on the project's requirements.",
  voice: "For cleaning up voiceover or podcast audio."
};

/* Opening quick replies: [label, text processed as if typed] */
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

/* ---------- Helpers (original names kept) ---------- */

function noahHas(text, words) {
  return words.some(function(word) {
    return text.indexOf(word) !== -1;
  });
}

function noahLink(url, label, color) {
  var external = /^https?:/.test(url);
  return '<a href="' + url.replace(/&/g, "&amp;") + '"' +
    (external ? ' target="_blank" rel="noopener"' : '') +
    ' style="color:' + (color || "#D4AF37") +
    ';font-weight:bold;">' + label + '</a>';
}

function noahContactLink() {
  return noahLink(NOAH_LINK, "Talk to ArkWay on WhatsApp →", "#E2C66B");
}

function noahServicesLink() {
  return noahLink("/services", "Explore Services →");
}

function noahProductsLink() {
  return noahLink("/products", "Browse the Sound Vault →");
}

function noahCommunityLink() {
  return noahLink("/community", "Explore Yovan's Music & Writing →");
}

function noahResetState() {
  noahState.lastTopic = "";
  noahState.lastQuestion = "";
  noahState.lastKeys = [];
  noahState.service = "";
  noahState.need = "";
  noahState.hasBeat = false;
  noahState.hasVocals = false;
  noahState.pending = "";
  noahState.fallbacks = 0;
  noahState.turns = 0;
}

function noahDefaultChips(topic) {
  if (topic === "audio") return [["Get pricing", "how much"], ["Book a session", "how do i book"]];
  if (topic === "film") return [["Get pricing", "how much"], ["Request a quote", "how do i contact you"]];
  if (topic === "brand" || topic === "data") return [["Request a quote", "how do i contact you"], ["Explore services", "what services do you offer"]];
  if (topic === "products") return [["Custom beat instead", "i need a custom beat"], ["Contact ArkWay", "how do i contact you"]];
  if (topic === "artist" || topic === "about") return [["Explore services", "what services do you offer"], ["Find a product", "where can i buy your products"]];
  return [["Explore services", "what services do you offer"], ["Get pricing", "how much do your services cost"]];
}

/* opts: keys (service keys discussed), keep (neutral reply, keep context),
   chips (array of [label,text]; [] for none), noRestart, pending, fallback */
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
  if (noahQuickRow && noahQuickRow.parentNode) {
    noahQuickRow.parentNode.removeChild(noahQuickRow);
  }
  noahQuickRow = null;
}

/* Quick replies are real buttons with their own click listeners.
   Only one row exists at a time, so old suggestions never pile up. */
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
    b.addEventListener("click", function() {
      window.handleNoahQuick(c[0], c[1]);
    });
    row.appendChild(b);
  });

  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
  noahQuickRow = row;
}

window.handleNoahQuick = function(label, text) {
  noahClearQuick();
  window.appendNoahMessage(label, true);
  if (text === "__restart") {
    setTimeout(noahRestart, 250);
    return;
  }
  setTimeout(function() { noahRespond(text); }, 250);
};

function noahRestart() {
  noahResetState();
  noahAnswer("Fresh start — I've cleared what we were discussing. What would you like to do?",
    "", { chips: NOAH_MAIN, noRestart: true });
}

/* ---------- Window / message plumbing ---------- */

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

    if (!noahState.greeted) {
      noahState.greeted = true;
    }

    // Only if the chat window is completely empty, add a welcome.
    var msgs = document.getElementById("noah-messages");
    if (msgs && !msgs.firstChild) {
      window.appendNoahMessage("Hi, I'm Noah, ArkWay's site guide. I can help you explore services, find products, check listed prices or reach the team. What are you working on?", false);
      noahAddQuick(NOAH_MAIN, true);
    }
  } else {
    win.classList.add("noah-hidden");
    if (container) container.classList.remove("active");
    if (openIcon) openIcon.style.display = "block";
    if (closeIcon) closeIcon.style.display = "none";
  }
};

/* User messages are inserted as plain text to prevent typed HTML
   from being interpreted as markup. Bot responses use trusted HTML
   built only from fixed strings (visitor text is never echoed into it). */
window.appendNoahMessage = function(text, isUser) {
  var container = document.getElementById("noah-messages");
  if (!container) return;

  if (!container.getAttribute("aria-live")) {
    container.setAttribute("aria-live", "polite");
    container.style.overscrollBehavior = "contain";
  }

  var msgDiv = document.createElement("div");
  msgDiv.className = "noah-msg " +
    (isUser ? "noah-msg-user" : "noah-msg-bot");

  if (isUser) {
    msgDiv.textContent = text;
  } else {
    msgDiv.innerHTML = text;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
};

window.handleNoahOption = function(key) {
  var quick = {
    services: ["Explore Services", "what services do you offer"],
    products: ["Find a Product", "where can i buy your products"],
    pricing:  ["Get Pricing", "how much do your services cost"],
    project:  ["Help With My Project", "i dont know which service i need"],
    contact:  ["Contact ArkWay", "how do i contact you"]
  };
  if (quick[key]) {
    window.handleNoahQuick(quick[key][0], quick[key][1]);
    return;
  }

  var options = {
    artist: {
      label: "Beats & Studio Services",
      topic: "audio",
      answer: "Got you. ArkWay offers beat packs and acoustic guitar loops, alongside recording, mixing, mastering and custom production.<br/><br/>" +
        noahProductsLink() + "<br/>" +
        noahServicesLink()
    },
    brand: {
      label: "Brand Architecture",
      topic: "brand",
      answer: "ArkWay helps artists, startups and businesses build a clearer identity and creative direction. Brand architecture and analytics projects are scoped to the client's needs.<br/><br/>" +
        noahServicesLink() + "<br/>" + noahContactLink()
    },
    film: {
      label: "Film Scoring & Audio",
      topic: "film",
      answer: "Need original music or audio for a film, series, advert or visual project? ArkWay offers film scoring, jingles and voiceover or podcast audio cleaning.<br/><br/>" +
        noahServicesLink() + "<br/>" +
        noahLink(NOAH_EMAIL, "Request a project quote →")
    },
    fan: {
      label: "Yovan's Music & Catalog",
      topic: "artist",
      answer: "Yovan is ArkWay's founder and an independent artist and producer. Explore his releases and creative writing through the community page.<br/><br/>" +
        noahCommunityLink() + "<br/>" +
        noahLink("https://substack.com/@betweenframesbyovan", "Read Between Frames →")
    }
  };

  var item = options[key];
  if (!item) return;

  noahClearQuick();
  window.appendNoahMessage(item.label, true);

  setTimeout(function() {
    noahAnswer(item.answer, item.topic);
  }, 250);
};

/* ---------- Original answer blocks (content unchanged) ---------- */

function noahAbout() {
  return "<strong>ArkWay Creative</strong> is a data-driven media company combining audio production, visual storytelling, brand architecture and analytics.<br/><br/>" +
    "Our work includes:<br/>" +
    "• Audio production and studio services<br/>" +
    "• Film scoring and media audio<br/>" +
    "• Brand architecture and creative strategy<br/>" +
    "• Market research and analytics<br/><br/>" +
    noahServicesLink() + "<br/>" + noahProductsLink();
}

function noahPrices() {
  return "<strong>ArkWay service rates</strong><br/>" +
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
    "Brand architecture and analytics projects are quoted according to scope. Confirm availability and the exact requirements with the team.<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
}

function noahAudio() {
  return "<strong>Audio production at ArkWay</strong><br/>" +
    "We can help with recording, custom production, mixing and mastering, guitar sessions, bass tracking and full instrumentation.<br/><br/>" +
    "• Quick Vocal Session — KSh 3,000<br/>" +
    "• External Vocal Mix & Master — KSh 2,500<br/>" +
    "• Complete Single Package — KSh 5,500<br/>" +
    "• Full Custom Beat & Song Production — KSh 8,500<br/>" +
    "• Guitar Session — KSh 2,500<br/>" +
    "• Live Bass Tracking — KSh 2,500<br/>" +
    "• Full Instrumentation — KSh 12,000<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
}

function noahProducts() {
  return "<strong>The ArkWay Sound Vault</strong><br/>" +
    "Explore the current digital products listed in the store, including:<br/>" +
    "• Acoustic guitar loop packs<br/>" +
    "• Boombap and boomtrap beat packs<br/>" +
    "• Atmospheric trap beat packs<br/>" +
    "• Chilled/R&B trap beat packs<br/>" +
    "• Hard trap beat packs<br/><br/>" +
    "Check the product listings for current prices, previews and purchase options.<br/><br/>" +
    noahProductsLink();
}

function noahFilm() {
  return "<strong>Film & media audio</strong><br/>" +
    "ArkWay creates original music and audio for visual projects, advertisements and spoken-word content.<br/><br/>" +
    "• Radio/Social Ads & Jingles — KSh 12,000<br/>" +
    "• Film/Series Scoring — from KSh 15,000<br/>" +
    "• Voiceover/Podcast Audio Cleaning — KSh 5,000<br/><br/>" +
    "Final quotes can depend on the project's requirements.<br/><br/>" +
    noahServicesLink() + "<br/>" +
    noahLink(NOAH_EMAIL, "Request a quote →");
}

function noahBrand() {
  return "<strong>Brand Architecture & Strategy</strong><br/>" +
    "ArkWay helps shape brand identity, creative direction and media strategy. Work is tailored to the project's needs, so brand and analytics services are quoted individually rather than assigned a one-size-fits-all price.<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
}

function noahData() {
  return "<strong>Data & Analytics</strong><br/>" +
    "ArkWay can support evidence-led decisions through market research, audience and performance analysis, dashboards and reporting.<br/><br/>" +
    "Project scope and pricing depend on the data and deliverables required.<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
}

function noahArtist() {
  return "<strong>Yovan</strong> is ArkWay Creative's founder, an independent hip-hop artist, producer and multi-instrumentalist. You can explore his music and creative writing through the community section.<br/><br/>" +
    noahCommunityLink() + "<br/>" +
    noahLink("https://substack.com/@betweenframesbyovan", "Read Between Frames →");
}

function noahContact() {
  return "Here's how to reach ArkWay:<br/>" +
    "• <strong>WhatsApp / Call:</strong> +254 118 618 199<br/>" +
    "• <strong>Email:</strong> arkwaycreative@gmail.com<br/><br/>" +
    noahContactLink() + "<br/>" +
    noahLink(NOAH_EMAIL, "Send an email →");
}

function noahLocation() {
  return "ArkWay Creative is based in Kenya. In-person recording sessions are available in the Kitale region, while suitable digital production and creative projects can be handled remotely.<br/><br/>" +
    "For current availability and session arrangements, contact the team directly.<br/><br/>" +
    noahContactLink();
}

function noahRegistration() {
  return "ArkWay Creative is a registered business in Kenya. For specific business, partnership or service questions, the team can provide further details directly.<br/><br/>" +
    noahContactLink();
}

function noahFallback() {
  return "I can help you explore ArkWay's services, find products, check listed prices, or connect with the team. What are you working on?";
}

/* ---------- New answer builders ---------- */

function noahLines(keys) {
  return keys.map(function(k) {
    return "• " + NOAH_SERVICES[k].name + " — " + NOAH_SERVICES[k].price;
  }).join("<br/>");
}

function noahKsh(n) {
  return "KSh " + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function noahServiceAnswer(keys, o) {
  o = o || {};
  var html = "";
  if (o.prefix) html += o.prefix + "<br/><br/>";
  if (keys.length === 1) {
    var s = NOAH_SERVICES[keys[0]];
    html += (o.yes ? "Yes — " : "") + "<strong>" + s.name + "</strong> — " + s.price +
      "<br/>" + NOAH_NOTES[keys[0]] + "<br/><br/>";
  } else {
    html += (o.yes ? "Yes. Here's what's listed:" : (o.pricing ? "Here are the listed prices:" : "Here's what's listed:")) +
      "<br/>" + noahLines(keys) + "<br/><br/>";
    if (keys.indexOf("film") !== -1 || keys.indexOf("ads") !== -1) {
      html += "Final quotes can depend on the project's requirements.<br/><br/>";
    }
    html += "Listed prices are per service. A project with several parts may need more than one, so confirm exact requirements with the team.<br/><br/>";
  }
  return html + noahServicesLink() + "<br/>" + noahContactLink();
}

function noahServiceChips(keys) {
  if (keys.length === 1) {
    return [["Book this", "how do i book"], ["Other services", "what services do you offer"]];
  }
  return [["Book one", "how do i book"], ["Full price list", "show full price list"]];
}

function noahSayServices(keys, topic, o) {
  noahAnswer(noahServiceAnswer(keys, o), topic, { keys: keys, chips: noahServiceChips(keys) });
}

function noahServicesOverview() {
  return "ArkWay's services fall into a few groups:<br/>" +
    "• <strong>Recording, mixing & mastering</strong> — vocals and finished singles<br/>" +
    "• <strong>Beats & full production</strong> — custom beat and song production<br/>" +
    "• <strong>Live instruments</strong> — guitar, bass and full instrumentation<br/>" +
    "• <strong>Film, ads & voice</strong> — scoring, jingles, voiceover and podcast audio cleaning<br/>" +
    "• <strong>Brand architecture & data analytics</strong> — quoted by scope<br/><br/>" +
    "Pick an area and I'll show what's listed.<br/><br/>" + noahServicesLink();
}

function noahPricingBroad() {
  return "Listed services run from KSh 2,500 up to KSh 12,000, with Film/Series Scoring from KSh 15,000. Which area should I price for?";
}

function noahNeedBeat() {
  return "There are two routes for a beat:<br/>" +
    "• <strong>Ready-made:</strong> beats and loop packs in the Sound Vault. Check each listing for its current price, preview and purchase option.<br/>" +
    "• <strong>Made for you:</strong> Full Custom Beat & Song Production — KSh 8,500. That's the full beat-and-song production service, so it isn't a beat-only price.<br/><br/>" +
    noahProductsLink() + "<br/>" + noahServicesLink();
}

function noahReleaseStart() {
  return "Nice — let's get your song moving. ArkWay's listed services cover the production side (beat, recording, mixing and mastering). For anything about the release itself, the team is the right contact.<br/><br/>" +
    "Where are you at right now?";
}

function noahReleaseChips() {
  return [
    ["I need a beat", "i need a beat for my song"],
    ["I have the beat", "i already have the beat"],
    ["Vocals recorded", "i already recorded my vocals"],
    ["Not sure", "i dont know where to start"]
  ];
}

function noahRoadmap() {
  return "Most songs move through a few steps. Here's how ArkWay's listed services line up:<br/>" +
    "• Beat: Sound Vault beats, or Full Custom Beat & Song Production — KSh 8,500<br/>" +
    "• Vocals: Quick Vocal Session — KSh 3,000<br/>" +
    "• Polish: External Vocal Mix & Master — KSh 2,500<br/>" +
    "• Or the Complete Single Package — KSh 5,500<br/><br/>" +
    "Tell me which step you're on and I'll narrow it down.";
}

function noahHasBeatAnswer() {
  var keys = ["vocal", "mixmaster", "single"];
  return "Perfect — since you already have the beat, you can skip buying or commissioning one. What's left is usually recording the vocals, then mixing and mastering:<br/>" +
    noahLines(keys) + "<br/><br/>" +
    "The Complete Single Package is listed separately, so check the Services page for exactly what it includes. Want guitar or bass added too?<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
}

function noahHasVocalsAnswer() {
  var keys = ["mixmaster", "single"];
  return "Great — then you're at the mixing and mastering stage:<br/>" +
    noahLines(keys) + "<br/><br/>" +
    "Check the Services page for what the Complete Single Package includes, and confirm the files you have with the team.<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
}

function noahHelpChoose() {
  return "Happy to help you find a starting point. What are you working on?";
}

function noahHuman() {
  return "Absolutely. The quickest way to reach a real person at ArkWay is WhatsApp or email. I'm an automated site guide, so I can't pass messages on myself, but the team can pick it up directly.<br/><br/>" +
    "• <strong>WhatsApp / Call:</strong> +254 118 618 199<br/>" +
    "• <strong>Email:</strong> arkwaycreative@gmail.com<br/><br/>" +
    noahContactLink() + "<br/>" +
    noahLink(NOAH_EMAIL, "Send an email →");
}

function noahCommunity() {
  return "The Community page is where Yovan's music and creative writing live. I don't have details on merchandise, collaborations or events here, so the team is the best source for those.<br/><br/>" +
    noahCommunityLink() + "<br/>" + noahContactLink();
}

function noahBookAnswer(key) {
  var s = NOAH_SERVICES[key];
  var wa = NOAH_LINK + "?text=" + encodeURIComponent("Hi ArkWay, I'd like to book: " + s.name);
  var em = NOAH_EMAIL + "?subject=" + encodeURIComponent("Booking inquiry: " + s.name) +
    "&body=" + encodeURIComponent("Hi ArkWay, I'd like to book: " + s.name + ". Here are my project details:");
  return "To book <strong>" + s.name + "</strong> (" + s.price + "), message the team with what you need. Nothing is booked until the team confirms it with you.<br/><br/>" +
    noahLink(wa, "Open WhatsApp →", "#E2C66B") + "<br/>" +
    noahLink(em, "Send an email →") + "<br/><br/>" +
    "You can also use the Book button on the service listing on the website.";
}

/* ---------- Language handling ---------- */

var NOAH_VOCAB = ["record", "recording", "recorded", "mixing", "mastering", "master", "guitar", "vocals",
  "vocal", "production", "produce", "podcast", "voiceover", "jingle", "jingles", "advert", "instrumental",
  "instrumentation", "pricing", "booking", "contact", "whatsapp", "services", "release", "single",
  "scoring", "soundtrack", "products", "budget", "studio", "beats", "loops", "package", "email",
  "discography", "polishing", "afford"];

function noahLev(a, b) {
  var m = a.length, n = b.length, i, j, dp = [];
  for (i = 0; i <= m; i++) { dp[i] = [i]; }
  for (j = 1; j <= n; j++) { dp[0][j] = j; }
  for (i = 1; i <= m; i++) {
    for (j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
    }
  }
  return dp[m][n];
}

/* Fixes small typos (e.g. "mastring", "recordin") against a short vocabulary.
   Only long words with the same first letter are touched, to avoid bad swaps. */
function noahFixTypos(t) {
  return t.split(" ").map(function(w) {
    if (w.length < 6 || /\d/.test(w) || NOAH_VOCAB.indexOf(w) !== -1) return w;
    var best = w, bestD = 99, limit = w.length >= 9 ? 2 : 1;
    NOAH_VOCAB.forEach(function(v) {
      if (v.charAt(0) !== w.charAt(0) || Math.abs(v.length - w.length) > limit) return;
      var d = noahLev(w, v);
      if (d <= limit && d < bestD) { best = v; bestD = d; }
    });
    return best;
  }).join(" ");
}

function noahNorm(text) {
  var t = String(text).toLowerCase().replace(/[’‘`']/g, "");
  t = t.replace(/&/g, " and ");
  t = t.replace(/(\d),(?=\d{3}\b)/g, "$1");
  t = t.replace(/(\d+(?:\.\d+)?)\s*k\b/g, function(m, n) { return String(Math.round(parseFloat(n) * 1000)); });
  t = t.replace(/(ksh|kshs|kes)(\d)/g, "$1 $2");
  t = t.replace(/[^a-z0-9\s]/g, " ");
  t = t.replace(/\bwanna\b/g, "want to").replace(/\bgonna\b/g, "going to")
    .replace(/\b(pls|plz)\b/g, "please").replace(/\bu\b/g, "you").replace(/\bur\b/g, "your")
    .replace(/\babt\b/g, "about").replace(/\bhw\b/g, "how").replace(/\bwat\b/g, "what");
  t = t.replace(/\s+/g, " ").trim();
  return noahFixTypos(t);
}

var NOAH_PATTERNS = {
  mix: /\b(mix|mixing|mixed|master|mastering|mastered|polish|polishing|polished|sound better)\b/,
  single: /\b(complete single|single package|full single)\b/,
  custom: /\b(custom beat|custom production|full custom|produce (my|a|the|this) (song|track)|song production|full song production|full production)\b/,
  guitar: /\bguitars?\b/,
  bass: /\bbass(es|ist)?\b/,
  full: /\b(instrumentation|live band|full band|all instruments|live instruments)\b/,
  ads: /\b(adverts?|advertisements?|ads?|jingles?|radio|commercials?)\b/,
  film: /\b(films?|movies?|series|scor(e|ing)|soundtrack|documentary|documentaries)\b/,
  voice: /\b(voice ?overs?|podcasts?|audio cleaning|clean(ing)? (up )?(my |the )?audio|narration)\b/
};

function noahParseAmount(q) {
  var m = q.match(/\b(\d{3,6})\b/);
  if (!m) return 0;
  var n = parseInt(m[1], 10);
  var yearish = n >= 1990 && n <= 2035;
  if (yearish && !/\b(ksh|kes|kshs|shillings?|budget)\b/.test(q)) return 0;
  return n;
}

function noahDetect(q) {
  var d = { keys: [], brand: false, data: false, product: false, beat: false, buyWord: false };
  var P = NOAH_PATTERNS, found = {}, k;

  for (k in P) { if (P.hasOwnProperty(k) && P[k].test(q)) found[k] = true; }
  if (found.mix) found.mixmaster = true;

  /* Stage flags */
  d.noBeat = /\b(dont have|do not have|no|need|want|looking for|get|find)\b.{0,12}\b(beat|beats|instrumental|instrumentals)\b/.test(q);
  d.hasBeat = !d.noBeat && (/\b(already|have|got|own|bought|made|sorted|ready)\b.{0,14}\b(beat|instrumental|instrumentals)\b/.test(q) ||
    /\b(beat|instrumental) (is )?(ready|done|sorted|finished)\b/.test(q));
  d.hasVocals = /\b(already|have|got|finished|done)\b.{0,14}\b(recorded|vocals|vocal|my recording|the recording)\b/.test(q) ||
    /\b(vocals?|recording|song) (is |are )?(recorded|done|finished|ready)\b/.test(q);

  /* Vocal recording: specific wording, or "vocals" without mixing wording */
  var vocalSpecific = /\b(record(ing)? (my |the |a |some )?(vocals?|voice|rap|verse|verses|hook|song|songs|track|tracks)|vocals? (session|recording|recorded)|quick vocal|sing|singing|rapping|studio (session|time))\b/.test(q);
  if (vocalSpecific || (/\bvocals?\b/.test(q) && !found.mix)) found.vocal = true;

  /* Generic "recording" or "studio" with no instrument named */
  var recGeneric = /\b(record|records|recording|recordings|studio)\b/.test(q);
  if (recGeneric && !found.vocal && !found.guitar && !found.bass && !found.full && !d.hasVocals) {
    found.vocal = true;
    if (!found.mix) { found.guitar = true; found.bass = true; }
  }

  /* Guitar loops are products, not the guitar session */
  if (/\bguitar (loops?|packs?)\b/.test(q)) found.guitar = false;
  /* If vocals are already recorded, do not offer vocal recording */
  if (d.hasVocals) found.vocal = false;

  NOAH_ORDER.forEach(function(key) { if (found[key]) d.keys.push(key); });

  d.product = /\b(products?|shop|store|buy|purchase|download|sound vault|packs?|loops?|samples?|beats?|instrumentals?|beatpacks?)\b/.test(q);
  d.beat = /\b(beats?|instrumentals?)\b/.test(q);
  d.buyWord = /\b(buy|purchase|download|sound vault|packs?|loops?|samples?|ready made|readymade|premade|store|shop|products?)\b/.test(q);
  d.brand = /\b(brand|branding|brand architecture|creative direction|campaign strategy|media strategy|positioning)\b/.test(q);
  d.data = /\b(analytics|data|market research|research|dashboards?|reporting|metrics|insights|business intelligence|audience analysis)\b/.test(q);

  /* Acts */
  d.amount = noahParseAmount(q);
  d.price = /\b(price|prices|pricing|cost|costs|charge|charges|rate|rates|fee|fees|how much|quote|quotation|ksh|kes|shillings?)\b/.test(q);
  d.fullList = /\b(price list|all (the )?(prices|rates|pricing)|full (price|pricing|rates)( list)?|every price|all services and prices)\b/.test(q);
  d.broadPrice = /\b(your|all|the|arkway)\b.{0,15}\b(services|prices|rates|pricing)\b/.test(q);
  d.budget = /\b(budget|afford|affordable|cheap|cheapest|inexpensive|low cost|limited funds)\b/.test(q) ||
    (d.amount > 0 && /\b(i have|ive got|only have|got|under|below|up to|max|maximum|within|less than|around|about|spend)\b/.test(q));
  d.book = /\b(book|booking|bookings|reserve|reservation|schedule|appointment|get started|how do (i|we) start)\b/.test(q);
  d.contact = /\b(contact|whatsapp|email|e mail|phone|phone number|call you|call us|reach you|reach out|get in touch|dm you|text you|message you)\b/.test(q);
  d.human = /\b(speak|talk|chat|connect|get)( to| with| me to| me with)? (a |an |the )?(someone|somebody|human|real person|person|team|agent|representative|staff|owner|yovan)\b/.test(q) ||
    /\b(real|actual) (person|human)\b/.test(q) || /\b(human|representative)\b/.test(q);
  d.unsure = /\b(not sure|unsure|dont know|do not know|help me (choose|decide|pick|figure)|which (service|one)|where (do i|should i|to) start|recommend|suggest|advice|what should i|help with my project|my project|can you help|need help|help me)\b/.test(q);
  d.release = /\b(release|releasing|put out|publish)\b/.test(q) ||
    /\b(launch|drop)\b.{0,10}\b(song|single|track|ep|album|music)\b/.test(q);
  d.songProject = /\b(make|create|start|write|build|produce|finish)\b.{0,14}\b(song|single|track|ep|album|music)\b/.test(q);
  d.more = /\b(tell me more|more (details|info|information)|explain|elaborate|whats included|what is included|how does (that|it) work|go on|details)\b/.test(q);
  d.yn = /^(do|can|could|will|are|is|does) (you|u|arkway)\b/.test(q);
  return d;
}

/* ---------- Flow handlers ---------- */

function noahBookFlow(d) {
  var S = noahState;
  var target = d.keys.length ? d.keys : (S.service ? [S.service] : S.lastKeys);

  if (target.length === 1) {
    noahAnswer(noahBookAnswer(target[0]), "audio", { keys: target, chips: [["Get pricing", "how much"]] });
    return;
  }
  if (target.length > 1) {
    var chips = target.slice(0, 4).map(function(k) {
      return [NOAH_SERVICES[k].name, "book " + NOAH_SERVICES[k].name];
    });
    noahAnswer("Which of these would you like to book?", S.lastTopic, { keys: target, chips: chips, pending: "book" });
    return;
  }
  if (d.brand || d.data || S.lastTopic === "brand" || S.lastTopic === "data") {
    noahAnswer("Brand and analytics projects are scoped individually, so the next step is to tell the team what you need and they'll advise.<br/><br/>" +
      noahContactLink() + "<br/>" + noahLink(NOAH_EMAIL, "Send an email →"), S.lastTopic, { keep: true, chips: [] });
    return;
  }
  noahAnswer("Happy to point you to the right booking route. Which service are you after?",
    "", { chips: NOAH_GROUPS, pending: "book" });
}

function noahBudgetFlow(d) {
  var S = noahState;
  if (!d.amount) {
    noahAnswer("Happy to match something to your budget. Roughly how much are you working with?", S.lastTopic, {
      keys: S.lastKeys,
      pending: "budget",
      chips: [
        ["Under KSh 3,000", "my budget is 3000"],
        ["Up to KSh 6,000", "my budget is 6000"],
        ["Up to KSh 12,000", "my budget is 12000"],
        ["KSh 15,000+", "my budget is 15000"]
      ]
    });
    return;
  }

  var pool;
  if (d.keys.length) pool = d.keys.slice();
  else if (S.need === "song" && S.hasVocals) pool = ["mixmaster", "single"];
  else if (S.need === "song" && S.hasBeat) pool = ["vocal", "mixmaster", "single", "guitar", "bass"];
  else if (S.lastTopic === "film") pool = ["voice", "ads", "film"];
  else pool = NOAH_ORDER.slice();

  var fits = pool.filter(function(k) { return NOAH_SERVICES[k].amount <= d.amount; });
  var html;
  if (!fits.length) {
    html = pool.length > 5 ?
      "With around " + noahKsh(d.amount) + ", that's a little under the lowest listed service (KSh 2,500). The team can tell you what's possible.<br/><br/>" + noahContactLink() :
      "With around " + noahKsh(d.amount) + ", that's under the listed price for what you asked about:<br/>" + noahLines(pool) +
      "<br/><br/>The team can tell you what's possible.<br/><br/>" + noahContactLink();
    noahAnswer(html, S.lastTopic, { keys: [], chips: [] });
    return;
  }
  html = "With around " + noahKsh(d.amount) + ", these listed services fit:<br/>" + noahLines(fits) + "<br/><br/>";
  if (S.lastTopic === "film" && d.amount < 15000) {
    html += "Film/Series Scoring starts from KSh 15,000.<br/><br/>";
  }
  html += "Each price is per service and a full project may combine several, so confirm the total with the team.<br/><br/>" +
    noahServicesLink() + "<br/>" + noahContactLink();
  noahAnswer(html, S.lastTopic || "services", { keys: fits, chips: [["Book one of these", "how do i book"]] });
}

function noahPriceFlow(d) {
  var S = noahState;
  if (d.fullList) {
    noahAnswer(noahPrices(), "services", { chips: [["Book a service", "how do i book"]] });
    return;
  }

  var keys = d.keys;
  if (keys.length === 1) { noahSayServices(keys, "audio"); return; }
  if (keys.length > 1) { noahSayServices(keys, "audio", { pricing: true }); return; }

  if (d.brand) { noahAnswer(noahBrand(), "brand"); return; }
  if (d.data) { noahAnswer(noahData(), "data"); return; }
  if (d.beat || (d.buyWord && d.product)) {
    noahAnswer(noahNeedBeat(), "products", { keys: ["custom"] });
    return;
  }

  /* Broad wording ("your services", "all prices") ignores earlier context */
  if (!d.broadPrice) {
    if (S.lastKeys.length === 1) { noahSayServices(S.lastKeys, S.lastTopic || "audio"); return; }
    if (S.lastKeys.length > 1) { noahSayServices(S.lastKeys, S.lastTopic || "audio", { pricing: true }); return; }
    if (S.lastTopic === "brand") { noahAnswer(noahBrand(), "brand"); return; }
    if (S.lastTopic === "data") { noahAnswer(noahData(), "data"); return; }
    if (S.lastTopic === "products") { noahAnswer(noahNeedBeat(), "products", { keys: ["custom"] }); return; }
    if (S.lastTopic === "audio") { noahAnswer(noahAudio(), "audio"); return; }
    if (S.lastTopic === "film") { noahAnswer(noahFilm(), "film"); return; }
  }

  var chips = NOAH_GROUPS.concat([["Full price list", "show full price list"]]);
  noahAnswer(noahPricingBroad(), "services", { chips: chips, pending: "price" });
}

function noahMoreFlow() {
  var S = noahState;
  if (S.lastKeys.length) { noahSayServices(S.lastKeys, S.lastTopic || "audio"); return; }
  if (S.lastTopic === "audio") { noahAnswer(noahAudio(), "audio"); return; }
  if (S.lastTopic === "products") { noahAnswer(noahProducts(), "products"); return; }
  if (S.lastTopic === "film") { noahAnswer(noahFilm(), "film"); return; }
  if (S.lastTopic === "brand") { noahAnswer(noahBrand(), "brand"); return; }
  if (S.lastTopic === "data") { noahAnswer(noahData(), "data"); return; }
  if (S.lastTopic === "artist") { noahAnswer(noahArtist(), "artist"); return; }
  if (S.lastTopic === "about") { noahAnswer(noahAbout(), "about"); return; }
  noahAnswer(noahFallback(), "", { keep: true, chips: NOAH_MAIN, noRestart: true, fallback: true });
}

/* ---------- Main response engine ---------- */

function noahRespond(raw) {
  var S = noahState;
  var q = noahNorm(raw);
  S.lastQuestion = q;
  S.turns++;
  var pend = S.pending;   // a pending question only applies to the very next message
  S.pending = "";

  if (!q) {
    noahAnswer(noahFallback(), "", { keep: true, chips: NOAH_MAIN, noRestart: true, fallback: true });
    return;
  }

  var wc = q.split(" ").length;

  if (wc <= 4 && /\b(start over|restart|reset|main menu|menu|begin again|new topic|clear chat)\b/.test(q)) {
    noahRestart();
    return;
  }

  /* Greeting only */
  if (/^(hi+|hello+|hey+|heya|yo|sup|whats up|good (morning|afternoon|evening)|niaje|sasa|mambo|hola|howdy)( there| noah| arkway| team)?$/.test(q)) {
    var first = !S.greeted && S.turns <= 1;
    S.greeted = true;
    noahAnswer(first ?
      "Yo! Welcome to ArkWay Creative. I'm Noah, your site guide. What are you looking for today — music production, products, film audio, brand services or Yovan's music?" :
      "Hey! What are you working on?",
      "", { keep: true, chips: NOAH_MAIN, noRestart: true });
    return;
  }

  /* Remove a leading greeting but keep the actual question */
  q = q.replace(/^(hi+|hello+|hey+|heya|yo|niaje|sasa|hola|howdy)( noah| there)? /, "");
  wc = q.split(" ").length;

  var d = noahDetect(q);

  /* Update remembered details from what the visitor just said */
  if (d.noBeat) S.hasBeat = false;
  if (d.hasBeat) S.hasBeat = true;
  if (d.hasVocals) { S.hasVocals = true; S.hasBeat = true; }
  if (d.release || d.songProject || d.hasBeat || d.hasVocals || (d.noBeat && /\b(song|track)\b/.test(q))) S.need = "song";

  /* Small talk */
  if (wc <= 6 && /\b(thanks|thank you|thx|asante|appreciate)\b/.test(q)) {
    noahAnswer("You're welcome! If you need help choosing a service or finding a product, just ask.<br/><br/>" + noahContactLink(),
      "", { keep: true, chips: [] });
    return;
  }
  if (/^(bye|goodbye|see you|cya|later|kwaheri)\b/.test(q)) {
    noahAnswer("Catch you later! I'm here whenever you need a hand.", "", { keep: true, chips: [] });
    return;
  }
  if (/^(no|nope|nah|nothing|no thanks|not now|thats all|thats it)$/.test(q)) {
    noahAnswer("No worries. If anything comes up, just ask.", "", { keep: true, chips: [["Explore services", "what services do you offer"]] });
    return;
  }
  if (/\b(who are you|what are you|your name|are you (a )?(bot|human|ai|real|robot|chatgpt))\b/.test(q)) {
    noahAnswer("I'm Noah, ArkWay Creative's website chatbot. I run on built-in site logic right now, so I can guide you around ArkWay but I don't have unrestricted AI reasoning. What can I help you find?",
      "", { keep: true, chips: NOAH_MAIN, noRestart: true });
    return;
  }
  if (/^(yes|yeah|yep|yup|ok|okay|sure|please|go ahead|alright|sounds good|yes please)$/.test(q)) {
    if (S.lastTopic) {
      noahAnswer("Cool. Would you like to see the relevant page, check pricing, or contact the team?<br/><br/>" +
        noahServicesLink() + "<br/>" + noahContactLink(),
        S.lastTopic, { keep: true, chips: [["Get pricing", "how much"], ["Book it", "how do i book"]] });
    } else {
      noahAnswer("Great. What would you like to explore?", "", { keep: true, chips: NOAH_MAIN, noRestart: true });
    }
    return;
  }

  /* Answers to a question Noah just asked */
  if (pend === "budget" && !d.amount) {
    var bm = q.match(/\b(\d{3,6})\b/);
    if (bm) d.amount = parseInt(bm[1], 10);
  }
  if (pend === "budget" && d.amount && !d.price && !d.book) { noahBudgetFlow(d); return; }
  if (pend === "book" && (d.keys.length || d.brand || d.data) && !d.price) { noahBookFlow(d); return; }
  if (pend === "price" && (d.keys.length || d.brand || d.data || d.beat) && !d.book) { noahPriceFlow(d); return; }

  /* Human / contact / booking / budget / price */
  if (d.human) {
    noahAnswer(noahHuman(), "contact", { keep: true, chips: [] });
    return;
  }
  if (d.contact) {
    noahAnswer(noahContact(), "contact", { keep: true, chips: [] });
    return;
  }
  if (d.book) { noahBookFlow(d); return; }
  if (d.budget) { noahBudgetFlow(d); return; }
  if (d.price) { noahPriceFlow(d); return; }

  /* Where the visitor is in making a song */
  if (d.hasVocals && !d.keys.length) {
    noahAnswer(noahHasVocalsAnswer(), "audio", { keys: ["mixmaster", "single"] });
    return;
  }
  if (d.hasBeat && !d.keys.length) {
    noahAnswer(noahHasBeatAnswer(), "audio", { keys: ["vocal", "mixmaster", "single"],
      chips: [["Record vocals", "i need to record vocals"], ["Mix & master", "can you mix and master my song"],
        ["Guitar or bass", "guitar and bass"]] });
    return;
  }

  /* Specific services */
  if (d.keys.length) {
    var prefix = (S.hasBeat && d.keys.indexOf("custom") === -1 && S.need === "song") ?
      "Since you already have the beat, you can skip beat production." : "";
    noahSayServices(d.keys, d.keys.indexOf("film") !== -1 || d.keys.indexOf("ads") !== -1 ? "film" : "audio",
      { yes: d.yn, prefix: prefix });
    return;
  }

  /* Beats */
  if (d.noBeat || (d.beat && !d.buyWord)) {
    noahAnswer(noahNeedBeat(), "products", { keys: ["custom"],
      chips: [["Browse products", "where can i buy your products"], ["I have the beat", "i already have the beat"]] });
    return;
  }

  if (d.release || d.songProject) {
    noahAnswer(noahReleaseStart(), "audio", { chips: noahReleaseChips() });
    return;
  }

  if (d.unsure) {
    if (S.need === "song") {
      noahAnswer(noahRoadmap(), "audio", { keys: ["custom", "vocal", "mixmaster", "single"], chips: noahReleaseChips().slice(0, 3) });
    } else {
      noahAnswer(noahHelpChoose(), "", { chips: [
        ["Making a song", "i want to make a song"],
        ["Film, ads or podcast", "ads film and voiceover"],
        ["Brand or data", "brand and data services"],
        ["Just browsing", "just browsing"]
      ] });
    }
    return;
  }

  /* Information topics */
  if (d.brand) { noahAnswer(noahBrand(), "brand"); return; }
  if (d.data) { noahAnswer(noahData(), "data"); return; }
  if (/\b(audio production|music production|studio services|production services?)\b/.test(q)) {
    noahAnswer(noahAudio(), "audio");
    return;
  }
  if (d.product) { noahAnswer(noahProducts(), "products"); return; }
  if (/\b(community|merch|merchandise|collab|collabs|collaboration|collaborations|collaborate|(your|any|upcoming|arkway) events?)\b/.test(q)) {
    noahAnswer(noahCommunity(), "community");
    return;
  }
  if (/\b(yovan|discography|between frames|your (own )?(music|songs|releases|catalogue|catalog)|listen to (your|his) music|who is the artist)\b/.test(q) ||
      /\b(founder|who founded|who started|who runs|who owns|owner|ceo|who is behind|who made arkway)\b/.test(q)) {
    noahAnswer(noahArtist(), "artist");
    return;
  }
  if (/\b(where are you|where is arkway|located|location|based in|kitale|kenya|in person|physical studio|remote|remotely)\b/.test(q) ||
      /\bwhere.{0,12}based\b/.test(q)) {
    noahAnswer(noahLocation(), "location", { chips: [["Contact ArkWay", "how do i contact you"]] });
    return;
  }
  if (/\b(registered|registration|is arkway legit|is this business legit|legitimate|business entity|legally registered)\b/.test(q)) {
    noahAnswer(noahRegistration(), "registration", { chips: [["Contact ArkWay", "how do i contact you"]] });
    return;
  }
  if (/\b(when was arkway|when did arkway|how long has arkway|history|established|what year)\b/.test(q)) {
    noahAnswer("ArkWay Creative was established in 2026. It brings audio production, visual storytelling, brand architecture and data analytics under one creative business.<br/><br/>" +
      noahServicesLink(), "about");
    return;
  }
  if (/\b(about arkway|what is arkway|what does arkway do|who is arkway|tell me about (arkway|you|the company)|what do you guys do|just browsing|just looking|exploring)\b/.test(q)) {
    noahAnswer(noahAbout(), "about", { chips: NOAH_GROUPS });
    return;
  }
  if (/\b(services|what (do you|can you) (offer|do|provide)|offerings|offer)\b/.test(q)) {
    noahAnswer(noahServicesOverview(), "services", { chips: NOAH_GROUPS });
    return;
  }

  /* "Tell me more" style follow-ups */
  if (d.more) { noahMoreFlow(); return; }

  /* Fallback: short, useful, and escalates to a human link if repeated */
  S.fallbacks++;
  var fb = noahFallback();
  if (S.fallbacks >= 2) {
    fb += "<br/><br/>If it's easier, the team can answer directly:<br/>" +
      noahContactLink() + "<br/>" + noahLink(NOAH_EMAIL, "Send an email →");
  }
  noahAnswer(fb, "", { keep: true, chips: NOAH_MAIN, noRestart: true, fallback: true });
}

window.sendNoahMessage = function() {
  var input = document.getElementById("noah-input");
  if (!input) return;

  var original = input.value.trim();
  if (!original) return;
  if (original.length > 500) original = original.slice(0, 500);

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

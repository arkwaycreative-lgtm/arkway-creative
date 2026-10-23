
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
   ========================================== */

var noahState = {
  lastTopic: "",
  lastQuestion: "",
  greeted: false
};

var NOAH_LINK = "https://wa.me/254118618199";
var NOAH_EMAIL = "mailto:arkwaycreative@gmail.com";

function noahHas(text, words) {
  return words.some(function(word) {
    return text.indexOf(word) !== -1;
  });
}

function noahLink(url, label, color) {
  return '<a href="' + url + '" style="color:' +
    (color || "#D4AF37") +
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

function noahAnswer(html, topic) {
  if (topic) noahState.lastTopic = topic;
  window.appendNoahMessage(html, false);
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

    if (!noahState.greeted) {
      noahState.greeted = true;
    }
  } else {
    win.classList.add("noah-hidden");
    if (container) container.classList.remove("active");
    if (openIcon) openIcon.style.display = "block";
    if (closeIcon) closeIcon.style.display = "none";
  }
};

/* User messages are inserted as plain text to prevent typed HTML
   from being interpreted as markup. Bot responses use trusted HTML. */
window.appendNoahMessage = function(text, isUser) {
  var container = document.getElementById("noah-messages");
  if (!container) return;

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

  window.appendNoahMessage(item.label, true);

  setTimeout(function() {
    noahAnswer(item.answer, item.topic);
  }, 250);
};

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
  return "I'm Noah, ArkWay's site guide. I can help you find the right information about:<br/><br/>" +
    "• 🎵 Beats, recording, mixing and production<br/>" +
    "• 📦 Products and guitar loops<br/>" +
    "• 🎬 Film scoring, jingles and audio cleaning<br/>" +
    "• 🎨 Brand architecture and creative strategy<br/>" +
    "• 📊 Market research and analytics<br/>" +
    "• 🎤 Yovan's music and writing<br/><br/>" +
    "Try asking something like <em>“How much is mixing?”</em>, <em>“Do you have guitar loops?”</em> or <em>“How can I book a session?”</em>";
}

function noahFollowUp(query) {
  var asksPrice = noahHas(query, [
    "how much", "how many shillings", "how much does",
    "how much is", "what does it cost", "what is the price",
    "what's the price", "price for that", "cost for that",
    "how much for that", "rates for that"
  ]);

  var asksMore = noahHas(query, [
    "tell me more", "more details", "explain more",
    "elaborate", "more info", "what else", "go on",
    "details please", "how does that work"
  ]);

  var asksBooking = noahHas(query, [
    "how do i book", "how can i book", "book it",
    "book that", "i want to book", "i want this",
    "how do i start", "how do we start"
  ]);

  if (!noahState.lastTopic) return null;

  if (asksPrice) {
    if (noahState.lastTopic === "audio") return noahAudio();
    if (noahState.lastTopic === "products") return noahProducts();
    if (noahState.lastTopic === "film") return noahFilm();
    if (noahState.lastTopic === "brand") return noahBrand();
    if (noahState.lastTopic === "data") return noahData();
    if (noahState.lastTopic === "services") return noahPrices();
  }

  if (asksMore) {
    if (noahState.lastTopic === "audio") return noahAudio();
    if (noahState.lastTopic === "products") return noahProducts();
    if (noahState.lastTopic === "film") return noahFilm();
    if (noahState.lastTopic === "brand") return noahBrand();
    if (noahState.lastTopic === "data") return noahData();
    if (noahState.lastTopic === "artist") return noahArtist();
    if (noahState.lastTopic === "about") return noahAbout();
  }

  if (asksBooking) {
    return "Let's get you pointed in the right direction. Tell the ArkWay team what you need and they'll help confirm the next step.<br/><br/>" +
      noahContactLink();
  }

  return null;
}

window.sendNoahMessage = function() {
  var input = document.getElementById("noah-input");
  if (!input) return;

  var original = input.value.trim();
  if (!original) return;

  var query = original.toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");

  window.appendNoahMessage(original, true);
  input.value = "";
  noahState.lastQuestion = query;

  setTimeout(function() {
    var answer = null;
    var topic = "";

    // Greetings and conversational basics
    if (/^(hi|hello|hey|yo|sup|what's up|whats up|good morning|good afternoon|good evening|niaje|sasa|mambo)[!.?, ]*$/.test(query)) {
      answer = "Yo! Welcome to ArkWay Creative. I'm Noah, your site guide. What are you looking for today — music production, products, film audio, brand services or Yovan's music?";
    }

    else if (noahHas(query, [
      "thank you", "thanks", "asante", "appreciate it",
      "that's helpful", "that helps"
    ])) {
      answer = "You're welcome! If you need help choosing a service or finding a product, just ask. " +
        noahContactLink();
    }

    else if (noahHas(query, [
      "who are you", "what are you", "your name",
      "are you a bot", "are you human", "are you ai",
      "are you an ai", "are you real"
    ])) {
      answer = "I'm Noah, ArkWay Creative's website chatbot. I run on built-in site logic right now, so I can guide you around ArkWay but I don't have unrestricted AI reasoning. What can I help you find?";
    }

    // Contact and booking questions
    else if (noahHas(query, [
      "contact", "whatsapp", "phone number", "call you",
      "email address", "your email", "reach you", "get in touch",
      "book a session", "book a service", "make a booking",
      "how to book", "how do i book", "booking", "inquire",
      "enquiry", "inquiry", "talk to someone", "speak to someone"
    ])) {
      answer = noahContact();
      topic = "contact";
    }

    // Price questions should be recognized before generic service keywords
    else if (noahHas(query, [
      "price", "prices", "pricing", "rate", "rates",
      "how much", "cost", "charges", "fee", "fees",
      "afford", "budget", "cheapest", "expensive",
      "ksh", "kes", "shillings"
    ])) {
      if (noahHas(query, [
        "film", "score", "movie", "series", "jingle",
        "advert", "advertisement", "voiceover", "podcast"
      ])) {
        answer = noahFilm();
        topic = "film";
      } else if (noahHas(query, [
        "brand", "branding", "analytics", "research",
        "dashboard", "data", "strategy"
      ])) {
        answer = noahBrand();
        topic = "brand";
      } else if (noahHas(query, [
        "beat", "loop", "sample", "pack", "product"
      ])) {
        answer = "Beat packs and guitar loops have their own product listings. Open the Sound Vault to check the current price, preview and purchase option for each item.<br/><br/>" +
          noahProductsLink();
        topic = "products";
      } else {
        answer = noahPrices();
        topic = "services";
      }
    }

    // Film and media audio
    else if (noahHas(query, [
      "film", "scoring", "score a film", "movie music",
      "series music", "soundtrack", "sound design",
      "jingle", "commercial audio", "advert", "advertisement",
      "radio ad", "video sound", "voiceover", "voice over",
      "podcast", "audio cleaning", "sound for my film"
    ])) {
      answer = noahFilm();
      topic = "film";
    }

    // Data and analytics
    else if (noahHas(query, [
      "analytics", "data analysis", "data analytics",
      "market research", "research", "dashboard",
      "dashboards", "reporting", "metrics", "insights",
      "audience analysis", "stream performance",
      "business intelligence", "data services"
    ])) {
      answer = noahData();
      topic = "data";
    }

    // Brand services
    else if (noahHas(query, [
      "brand architecture", "branding", "brand strategy",
      "brand identity", "brand positioning", "creative direction",
      "campaign strategy", "media strategy", "brand services",
      "position my brand", "my business brand"
    ])) {
      answer = noahBrand();
      topic = "brand";
    }

    // Music products and sound packs
    else if (noahHas(query, [
      "beat", "beats", "beat pack", "beatpacks",
      "guitar loop", "guitar loops", "loop pack",
      "loops", "sample pack", "sound vault",
      "sound pack", "producer pack", "instrumental",
      "buy a beat", "buy beats", "buy loops",
      "download beats", "download loops", "products",
      "shop", "store"
    ])) {
      answer = noahProducts();
      topic = "products";
    }

    // Studio and instrument services
    else if (noahHas(query, [
      "mix", "mixing", "master", "mastering",
      "record", "recording", "studio", "vocal",
      "vocals", "song production", "produce a song",
      "music production", "custom beat", "guitar session",
      "play guitar", "bass tracking", "bass session",
      "instrumentation", "full production", "record my song",
      "finish my song", "my song"
    ])) {
      answer = noahAudio();
      topic = "audio";
    }

    // Yovan and the creative catalog
    else if (noahHas(query, [
      "yovan", "artist music", "your artist",
      "music catalog", "discography", "songs",
      "listen to music", "between frames", "film writing",
      "who is the artist", "artist releases"
    ])) {
      answer = noahArtist();
      topic = "artist";
    }

    // Location and remote availability
    else if (noahHas(query, [
      "where are you", "where is arkway", "location",
      "located", "based", "which town", "which country",
      "kenya", "kitale", "in person", "physical studio",
      "remote", "online service", "do you work remotely"
    ])) {
      answer = noahLocation();
      topic = "location";
    }

    // Registration / legitimacy
    else if (noahHas(query, [
      "registered", "registration", "is arkway legit",
      "is this business legit", "legitimate",
      "business entity", "legally registered"
    ])) {
      answer = noahRegistration();
      topic = "registration";
    }

    // Founder / company background
    else if (noahHas(query, [
      "founder", "who founded", "who started",
      "who runs", "who built", "owner of arkway",
      "who owns", "ceo", "who is behind arkway"
    ])) {
      answer = noahArtist();
      topic = "artist";
    }

    else if (noahHas(query, [
      "what does arkway do", "what is arkway",
      "about arkway", "tell me about arkway",
      "your services", "what services",
      "what do you offer", "what can you do",
      "what do you guys do"
    ])) {
      answer = noahAbout();
      topic = "about";
    }

    // Company age/history
    else if (noahHas(query, [
      "when was arkway", "when did arkway start",
      "how long has arkway", "history of arkway",
      "when was it established", "established",
      "what year did arkway"
    ])) {
      answer = "ArkWay Creative was established in 2026. It brings audio production, visual storytelling, brand architecture and data analytics under one creative business.<br/><br/>" +
        noahServicesLink();
      topic = "about";
    }

    // Follow-up questions use the most recent conversation topic
    else {
      var followUp = noahFollowUp(query);
      if (followUp) {
        answer = followUp;
        topic = noahState.lastTopic;
      }
    }

    // Small conversational shortcuts
    if (!answer && noahHas(query, [
      "yes", "yeah", "yep", "okay", "ok", "sure"
    ]) && noahState.lastTopic) {
      answer = "Cool. Would you like to see the relevant page, check pricing, or contact the team?<br/><br/>" +
        noahServicesLink() + "<br/>" + noahContactLink();
      topic = noahState.lastTopic;
    }

    if (!answer) {
      answer = noahFallback();
    }

    noahAnswer(answer, topic);
  }, 250);
};

window.handleNoahKeyPress = function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    window.sendNoahMessage();
  }
};

})();
